#!/usr/bin/env python3

print("=== STARTING SCRIPT ===")

import argparse
import usb.core
import usb.util
from escpos import printer
from escpos.printer import Usb
from PIL import Image
from typing import Optional, Tuple
import time
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

print("=== IMPORTS COMPLETED ===")

def find_printer() -> Optional[Tuple[int, int]]:
    print("Searching for printer...")
    # Find all USB devices
    devices = usb.core.find(find_all=True)
    if not devices:
        print("No USB devices found at all!")
        return None

    print("Listing all USB devices:")
    for device in devices:
        vendor_id = device.idVendor
        product_id = device.idProduct
        print(f"Device found: vendor_id={hex(vendor_id)}, product_id={hex(product_id)}")

        # Get more device info
        try:
            manufacturer = usb.util.get_string(device, device.iManufacturer)
            product = usb.util.get_string(device, device.iProduct)
            print(f"  Manufacturer: {manufacturer}")
            print(f"  Product: {product}")
        except:
            print("  Could not get device strings")

        if vendor_id == 0x1fc9 and product_id == 0x2016:
            print("Found matching printer!")
            try:
                # Check device configuration
                cfg = device.get_active_configuration()
                print(f"Active configuration: {cfg}")

                # List endpoints
                for intf in cfg:
                    print(f"Interface {intf.bInterfaceNumber}:")
                    for ep in intf:
                        print(f"  Endpoint {ep.bEndpointAddress:02x}")

                if device.is_kernel_driver_active(0):
                    print("Attempting to detach kernel driver...")
                    device.detach_kernel_driver(0)
            except Exception as e:
                print(f"Error during device configuration check: {e}")

            return (vendor_id, product_id)

    print("No matching printer found")
    return None

def initialize_printer(vendor_id: int, product_id: int, max_retries: int = 3) -> Optional[Usb]:
    """Initialize printer with retry mechanism"""
    for attempt in range(max_retries):
        try:
            print(f"Attempting to initialize printer (attempt {attempt + 1}/{max_retries})...")

            # Add more debugging for device creation
            print(f"Creating USB device with vendor_id={hex(vendor_id)}, product_id={hex(product_id)}")
            device = Usb(idVendor=vendor_id,
                        idProduct=product_id,
                        timeout=5000,
                        in_ep=0x81,  # Try explicit endpoints
                        out_ep=0x01)

            # Test if device is ready
            print("Testing device connection...")
            device.text("")  # Send empty text to test connection

            print("Printer initialized successfully")
            return device

        except Exception as e:
            print(f"Initialization attempt failed with error: {str(e)}")
            print(f"Error type: {type(e)}")
            if attempt < max_retries - 1:
                print(f"Waiting 2 seconds before retry...")
                time.sleep(2)
            else:
                print("Failed all retry attempts")
                return None
    return None

def publish(path: str, vendor_id: Optional[int] = None, product_id: Optional[int] = None) -> None:
    print("\n=== Starting publish function ===")
    device = None
    try:
        # If no IDs provided, try to find the printer
        if vendor_id is None or product_id is None:
            print("No vendor/product IDs provided, searching for printer...")
            printer_info = find_printer()
            if printer_info is None:
                raise Exception("NXP printer not found. Please make sure it's connected and powered on.")
            vendor_id, product_id = printer_info
            print(f"Found printer with vendor ID: {hex(vendor_id)}, product ID: {hex(product_id)}")

        # Initialize USB printer with retry mechanism
        print("Starting printer initialization...")
        device = initialize_printer(vendor_id, product_id)
        if device is None:
            raise Exception("Failed to initialize printer after multiple attempts")

        # Load and process the image
        print(f"Loading image from: {path}")
        image = Image.open(path)
        print(f"Original image size: {image.size}")

        # Convert to black and white
        image = image.convert('1')  # Convert to 1-bit black and white

        # Split image into chunks and print each chunk
        chunk_height = 600  # Adjust this value if needed
        width, height = image.size

        print(f"Splitting image into chunks of {chunk_height} pixels height")
        for y_start in range(0, height, chunk_height):
            # Calculate the height of this chunk (might be smaller for last chunk)
            current_chunk_height = min(chunk_height, height - y_start)

            # Crop the chunk
            chunk = image.crop((0, y_start, width, y_start + current_chunk_height))
            print(f"Printing chunk from y={y_start} to y={y_start + current_chunk_height}")

            try:
                device.image(chunk, center=False)
                print(f"Chunk printed successfully")

                # Small delay between chunks to allow printer to catch up
                time.sleep(0.5)

            except usb.core.USBError as e:
                print(f"Error printing chunk: {e}")
                # Try to recover
                device.close()
                device = initialize_printer(vendor_id, product_id)
                if not device:
                    raise Exception("Failed to recover printer connection")
                # Retry this chunk
                device.image(chunk, center=False)

        print("All chunks printed successfully")

        # Cut the paper
        print("Sending cut command...")
        device.cut()
        print("Cut command sent")

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if device:
            try:
                print("Closing printer connection...")
                device.close()
                print("Printer connection closed")
            except Exception as e:
                print(f"Warning: Error while closing printer: {e}")

def parse_hex(hex_str: str) -> int:
    """Convert hexadecimal string to integer."""
    try:
        # Remove '0x' prefix if present
        hex_str = hex_str.replace('0x', '')
        return int(hex_str, 16)
    except ValueError:
        raise ValueError(f"Invalid hexadecimal value: {hex_str}")

def main() -> None:
    print("\n=== Starting main function ===")
    parser = argparse.ArgumentParser(
        description='Print an image using an ESC/POS thermal printer.',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )

    parser.add_argument(
        'image_path',
        help='Path to the image file to print'
    )

    parser.add_argument(
        '--vendor-id',
        help='USB Vendor ID in hexadecimal (e.g., 1fc9). If not provided, will auto-detect.'
    )

    parser.add_argument(
        '--product-id',
        help='USB Product ID in hexadecimal (e.g., 2016). If not provided, will auto-detect.'
    )

    args = parser.parse_args()
    print(f"Arguments parsed: {args}")

    vendor_id = None
    product_id = None

    if args.vendor_id and args.product_id:
        try:
            vendor_id = parse_hex(args.vendor_id)
            product_id = parse_hex(args.product_id)
            print(f"Using provided IDs: vendor_id={hex(vendor_id)}, product_id={hex(product_id)}")
        except ValueError as e:
            print(f"Error: {str(e)}")
            return

    publish(args.image_path, vendor_id, product_id)

if __name__ == "__main__":
    print("\n=== Script starting ===")
    main()
    print("=== Script completed ===")
