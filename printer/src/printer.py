#!/usr/bin/env python3

print("=== STARTING SCRIPT ===")  # Basic startup confirmation

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

    for device in devices:
        vendor_id = device.idVendor
        product_id = device.idProduct
        print(f"Found device: vendor_id={hex(vendor_id)}, product_id={hex(product_id)}")

        if vendor_id == 0x1fc9 and product_id == 0x2016:
            print("Found matching printer!")
            if device.is_kernel_driver_active(0):
                try:
                    print("Attempting to detach kernel driver...")
                    device.detach_kernel_driver(0)
                except usb.core.USBError as e:
                    print(f"Could not detach kernel driver: {e}")
            return (vendor_id, product_id)

    print("No matching printer found")
    return None

def initialize_printer(vendor_id: int, product_id: int, max_retries: int = 3) -> Optional[Usb]:
    """Initialize printer with retry mechanism"""
    for attempt in range(max_retries):
        try:
            print(f"Attempting to initialize printer (attempt {attempt + 1}/{max_retries})...")
            device = Usb(idVendor=vendor_id,
                        idProduct=product_id,
                        timeout=5000)  # 5 second timeout
            print("Printer initialized successfully")
            return device
        except Exception as e:
            print(f"Initialization attempt failed with error: {e}")
            if attempt < max_retries - 1:
                print(f"Waiting 2 seconds before retry...")
                time.sleep(2)
            else:
                raise e
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
        print(f"Image loaded successfully. Size: {image.size}")

        # Print the image
        print("Starting to send image to printer...")
        device.image(image)
        print("Image sent to printer")

        # Ensure buffer is cleared before cutting
        print("Flushing printer buffer...")
        device.flush()
        print("Buffer flushed")

        # Cut the paper
        print("Sending cut command...")
        device.cut()
        print("Cut command sent")
        print("Printing completed successfully!")

    except FileNotFoundError:
        print(f"Error: Image file not found: {path}")
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
