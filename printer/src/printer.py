#!/usr/bin/env python3

import argparse
import usb.core
import usb.util
from escpos import printer
from escpos.printer import Usb
from PIL import Image
from typing import Optional, Tuple
import time

def find_printer() -> Optional[Tuple[int, int]]:
    print("Searching for printer...")
    devices = usb.core.find(find_all=True)

    for device in devices:
        vendor_id = device.idVendor
        product_id = device.idProduct
        print(f"Found device: vendor_id={hex(vendor_id)}, product_id={hex(product_id)}")

        if vendor_id == 0x1fc9 and product_id == 0x2016:
            if device.is_kernel_driver_active(0):
                try:
                    device.detach_kernel_driver(0)
                except usb.core.USBError as e:
                    print(f"Could not detach kernel driver: {e}")
            return (vendor_id, product_id)
    return None

def initialize_printer(vendor_id: int, product_id: int) -> Optional[Usb]:
    try:
        device = Usb(idVendor=vendor_id,
                    idProduct=product_id,
                    timeout=5000)
        return device
    except Exception as e:
        print(f"Printer initialization failed: {e}")
        return None

def process_image(image: Image.Image, max_width: int = 576) -> Image.Image:
    """Process image for thermal printer"""
    # Convert to grayscale
    if image.mode not in ('L', '1'):
        image = image.convert('L')

    # Resize if needed while maintaining aspect ratio
    if image.size[0] > max_width:
        ratio = max_width / float(image.size[0])
        height = int(float(image.size[1]) * ratio)
        image = image.resize((max_width, height), Image.LANCZOS)

    # Convert to pure black and white
    image = image.convert('1', dither=Image.FLOYDSTEINBERG)

    return image

def print_image_in_chunks(device: Usb, image: Image.Image, chunk_lines: int = 1000):  # Increased from 30 to 100
    """Print image in chunks with delays"""
    width, height = image.size

    for start_y in range(0, height, chunk_lines):
        # Get chunk of image
        chunk_height = min(chunk_lines, height - start_y)
        chunk = image.crop((0, start_y, width, start_y + chunk_height))

        print(f"Printing chunk {start_y//chunk_lines + 1} of {(height + chunk_lines - 1)//chunk_lines}")

        # Print chunk
        device._raw(b'\x1B@')  # Initialize printer
        device.image(chunk)
        device._raw(b'\x1B@')  # Reset printer after chunk

        # Delay between chunks
        time.sleep(0.5)

def publish(path: str, vendor_id: Optional[int] = None, product_id: Optional[int] = None) -> None:
    print("\n=== Starting publish function ===")
    device = None
    try:
        if vendor_id is None or product_id is None:
            printer_info = find_printer()
            if printer_info is None:
                raise Exception("NXP printer not found.")
            vendor_id, product_id = printer_info
            print(f"Found printer with vendor ID: {hex(vendor_id)}, product ID: {hex(product_id)}")

        device = initialize_printer(vendor_id, product_id)
        if device is None:
            raise Exception("Failed to initialize printer")

        # Test printer with simple text
        print("Testing printer with text...")
        device._raw(b'\x1B@')  # Initialize printer
        time.sleep(1)  # Wait a second before printing image

        print(f"Loading image from: {path}")
        image = Image.open(path)
        print(f"Original image size: {image.size}")

        # Process image
        processed_image = process_image(image)
        print(f"Processed image size: {processed_image.size}")

        print("Starting print process...")
        print_image_in_chunks(device, processed_image)

        print("Print completed, cutting paper...")
        device.cut()

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if device:
            try:
                device.close()
            except Exception as e:
                print(f"Error closing printer: {e}")

def parse_hex(hex_str: str) -> int:
    try:
        hex_str = hex_str.replace('0x', '')
        return int(hex_str, 16)
    except ValueError:
        raise ValueError(f"Invalid hexadecimal value: {hex_str}")

def main() -> None:
    parser = argparse.ArgumentParser(
        description='Print an image using an ESC/POS thermal printer.'
    )
    parser.add_argument('image_path', help='Path to the image file to print')
    parser.add_argument('--vendor-id', help='USB Vendor ID in hexadecimal (e.g., 1fc9)')
    parser.add_argument('--product-id', help='USB Product ID in hexadecimal (e.g., 2016)')

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
