import {convertImageForThermalPrinter} from '@/app/lib/image/dither';
import html2canvas from 'html2canvas';

async function captureElementWithImages(element: HTMLElement): Promise<string> {
  async function convertImageToBase64(img: HTMLImageElement): Promise<string> {
    // Skip if already a data URL
    if (img.src.startsWith('data:')) {
      return img.src;
    }

    // Fetch the image
    const response = await fetch(img.src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Get the blob
    const blob = await response.blob();

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(blob);
    });
  }

  async function prepareImagesInElement(element: HTMLElement): Promise<void> {
    const images = element.getElementsByTagName('img');

    const conversions = Array.from(images).map(async img => {
      if (!img.src.startsWith('data:') && img.complete) {
        try {
          img.src = await convertImageToBase64(img);
        } catch (error) {
          console.warn(`Failed to convert image: ${img.src}`, error);
        }
      }
    });

    await Promise.all(conversions);
  }

  const options = {
    scale: window.devicePixelRatio,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
    logging: true, // Enable logging to debug image issues
    backgroundColor: null,
    onclone: (clonedDoc: Document) => {
      const clonedElement = clonedDoc.body.querySelector(
        `[data-capture-id="${element.dataset.captureId}"]`
      ) as HTMLElement;
      if (clonedElement) {
        // clonedElement.style.backgroundColor = 'red';
      }
    },
  };

  try {
    // Add unique identifier to target element
    element.dataset.captureId = `capture-${Date.now()}`;

    // Ensure all images are loaded first
    await prepareImagesInElement(element);

    let canvas = await html2canvas(element, options);

    // Handle iOS canvas size limits
    const maxSize = 16384;
    if (canvas.width > maxSize || canvas.height > maxSize) {
      const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = canvas.width * scale;
      scaledCanvas.height = canvas.height * scale;
      const ctx = scaledCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.scale(scale, scale);
      ctx.drawImage(canvas, 0, 0);
      canvas = scaledCanvas;
    }

    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Capture failed:', error);
    throw error;
  } finally {
    // Clean up
    delete element.dataset.captureId;
  }
}

// Usage example
const screenshot = async (elementId: string) => {
  try {
    const element = document.getElementById(elementId);

    if (!element || !(element instanceof HTMLElement)) {
      throw new Error('Element not found');
    }

    return await convertImageForThermalPrinter(await captureElementWithImages(element));
  } catch (error) {
    alert(`Capture failed: ${(error as Error).message}`);
  }
};

export {screenshot};
