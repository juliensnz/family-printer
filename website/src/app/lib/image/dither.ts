interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

const convertImageForThermalPrinter = async (base64Image: string): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Create an image element
      const img = new Image();

      img.onload = () => {
        // Calculate height maintaining aspect ratio
        const crop = 90;
        const targetWidth = 600;
        const croppedHeight = img.height - crop;
        const aspectRatio = croppedHeight / img.width;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        // Create canvas at target size
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw image to canvas with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          0,
          crop, // Start copying from x=0, y=90 in source image
          img.width,
          croppedHeight, // Use full width, but reduce height by 90px
          0,
          0, // Place at top-left of canvas
          targetWidth,
          targetHeight // Scale to target dimensions
        );

        // Get image data
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const {width, height, data} = imageData;

        // Convert data to 2D array of pixels for easier processing
        const pixels: Pixel[][] = [];
        for (let y = 0; y < height; y++) {
          pixels[y] = [];
          for (let x = 0; x < width; x++) {
            const pos = (y * width + x) * 4;
            pixels[y][x] = {
              r: data[pos],
              g: data[pos + 1],
              b: data[pos + 2],
              a: data[pos + 3],
            };
          }
        }

        // Apply Floyd-Steinberg dithering
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const pixel = pixels[y][x];

            // Convert to grayscale
            const oldGray = (pixel.r + pixel.g + pixel.b) / 3;

            // Determine new black or white value
            const newGray = oldGray < 128 ? 0 : 255;

            // Calculate error
            const error = oldGray - newGray;

            // Set current pixel to black or white
            pixel.r = pixel.g = pixel.b = newGray;

            // Distribute error to neighboring pixels
            if (x + 1 < width) {
              const right = pixels[y][x + 1];
              right.r += (error * 7) / 16;
              right.g += (error * 7) / 16;
              right.b += (error * 7) / 16;
            }

            if (y + 1 < height) {
              if (x > 0) {
                const bottomLeft = pixels[y + 1][x - 1];
                bottomLeft.r += (error * 3) / 16;
                bottomLeft.g += (error * 3) / 16;
                bottomLeft.b += (error * 3) / 16;
              }

              const bottom = pixels[y + 1][x];
              bottom.r += (error * 5) / 16;
              bottom.g += (error * 5) / 16;
              bottom.b += (error * 5) / 16;

              if (x + 1 < width) {
                const bottomRight = pixels[y + 1][x + 1];
                bottomRight.r += (error * 1) / 16;
                bottomRight.g += (error * 1) / 16;
                bottomRight.b += (error * 1) / 16;
              }
            }
          }
        }

        // Apply processed pixels back to image data
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const pos = (y * width + x) * 4;
            const pixel = pixels[y][x];
            data[pos] = Math.max(0, Math.min(255, Math.round(pixel.r)));
            data[pos + 1] = Math.max(0, Math.min(255, Math.round(pixel.g)));
            data[pos + 2] = Math.max(0, Math.min(255, Math.round(pixel.b)));
            data[pos + 3] = pixel.a;
          }
        }

        // Put processed image data back to canvas
        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to buffer
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };

      img.onerror = error => {
        reject(error);
      };

      // Set image source to trigger loading
      img.src = base64Image;
    } catch (error) {
      console.error('Error processing image:', error);
      reject(error);
    }
  });
};

export {convertImageForThermalPrinter};
