#!/usr/bin/env python3
import argparse
import usb.core
import usb.util
from escpos import printer
from escpos.printer import Usb
from PIL import Image
from typing import Optional, Tuple

def find_printer() -> Optional[Tuple[int, int]]:
    """
    Search for the NXP printer and return its vendor and product IDs.
    Returns None if printer is not found.
    """
    # Find all USB devices
    devices = usb.core.find(find_all=True)

    for device in devices:
        # Convert IDs to hex strings for comparison
        vendor_id = device.idVendor
        product_id = device.idProduct

        # Check if this is the NXP printer
        if vendor_id == 0x1fc9 and product_id == 0x2016:
            return (vendor_id, product_id)

    return None

def publish(path: str, vendor_id: Optional[int] = None, product_id: Optional[int] = None) -> None:
    try:
        # If no IDs provided, try to find the printer
        if vendor_id is None or product_id is None:
            printer_info = find_printer()
            if printer_info is None:
                raise Exception("NXP printer not found. Please make sure it's connected and powered on.")
            vendor_id, product_id = printer_info
            print(f"Found printer with vendor ID: {hex(vendor_id)}, product ID: {hex(product_id)}")

        # Initialize USB printer
        device = Usb(idVendor=vendor_id, idProduct=product_id)

        # Load and process the image
        print(f"Loading image from: {path}")
        image = Image.open(path)

        # Configure printer settings
        device.set(align='LEFT')

        # Print the image
        print("Printing image...")
        device.image(image)

        # Cut the paper and close
        device.cut()
        device.close()
        print("Printing completed successfully!")

    except FileNotFoundError:
        print(f"Error: Image file not found: {path}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

def parse_hex(hex_str: str) -> int:
    """Convert hexadecimal string to integer."""
    try:
        # Remove '0x' prefix if present
        hex_str = hex_str.replace('0x', '')
        return int(hex_str, 16)
    except ValueError:
        raise ValueError(f"Invalid hexadecimal value: {hex_str}")

def main() -> None:
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

    vendor_id = None
    product_id = None

    if args.vendor_id and args.product_id:
        try:
            vendor_id = parse_hex(args.vendor_id)
            product_id = parse_hex(args.product_id)
        except ValueError as e:
            print(f"Error: {str(e)}")
            return

    publish(args.image_path, vendor_id, product_id)

if __name__ == "__main__":
    main()
