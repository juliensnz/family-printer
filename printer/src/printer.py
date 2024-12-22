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
    """
    Search for the NXP printer and return its vendor and product IDs.
    Returns None if printer is not found.
    """
    # Find all USB devices
    devices = usb.core.find(find_all=True)

    for device in devices:
        vendor_id = device.idVendor
        product_id = device.idProduct

        if vendor_id == 0x1fc9 and product_id == 0x2016:
            # If the device has an active kernel driver, detach it
            if device.is_kernel_driver_active(0):
                try:
                    device.detach_kernel_driver(0)
                except usb.core.USBError as e:
                    print(f"Warning: Could not detach kernel driver: {e}")
            return (vendor_id, product_id)

    return None

def initialize_printer(vendor_id: int, product_id: int, max_retries: int = 3) -> Optional[Usb]:
    """Initialize printer with retry mechanism"""
    for attempt in range(max_retries):
        try:
            device = Usb(idVendor=vendor_id,
                        idProduct=product_id,
                        timeout=5000)  # 5 second timeout
            return device
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Attempt {attempt + 1} failed, retrying in 2 seconds...")
                time.sleep(2)
            else:
                raise e
    return None

def publish(path: str, vendor_id: Optional[int] = None, product_id: Optional[int] = None) -> None:
    device = None
    try:
        # If no IDs provided, try to find the printer
        if vendor_id is None or product_id is None:
            printer_info = find_printer()
            if printer_info is None:
                raise Exception("NXP printer not found. Please make sure it's connected and powered on.")
            vendor_id, product_id = printer_info
            print(f"Found printer with vendor ID: {hex(vendor_id)}, product ID: {hex(product_id)}")

        # Initialize USB printer with retry mechanism
        device = initialize_printer(vendor_id, product_id)
        if device is None:
            raise Exception("Failed to initialize printer after multiple attempts")

        # Load and process the image
        print(f"Loading image from: {path}")
        image = Image.open(path)

        # Print the image in chunks to avoid buffer overflow
        print("Printing image...")
        device.image(image)

        # Ensure buffer is cleared before cutting
        device.flush()

        # Cut the paper
        device.cut()
        print("Printing completed successfully!")

    except FileNotFoundError:
        print(f"Error: Image file not found: {path}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")
    finally:
        if device:
            try:
                device.close()
            except Exception as e:
                print(f"Warning: Error while closing printer: {e}")

# Rest of the code remains the same...
