import sharp from 'sharp';

interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

const convertImageForThermalPrinter = async (inputBuffer: Buffer): Promise<Buffer> => {
  return new Promise<Buffer>(async (resolve, reject) => {
    try {
      // Load the image and convert to raw pixel data
      const image = await sharp(inputBuffer).raw().toBuffer({resolveWithObject: true});

      const {data, info} = image;
      const {width, height, channels} = info;

      // Create a new Uint8Array for the processed image
      const outputArray = new Uint8Array(width * height * channels);

      // Convert data to 2D array of pixels for easier processing
      const pixels: Pixel[][] = [];
      for (let y = 0; y < height; y++) {
        pixels[y] = [];
        for (let x = 0; x < width; x++) {
          const pos = (y * width + x) * channels;
          pixels[y][x] = {
            r: data[pos],
            g: data[pos + 1],
            b: data[pos + 2],
            a: channels === 4 ? data[pos + 3] : 255,
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

      // Convert back to Uint8Array
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pos = (y * width + x) * channels;
          const pixel = pixels[y][x];
          outputArray[pos] = Math.max(0, Math.min(255, Math.round(pixel.r)));
          outputArray[pos + 1] = Math.max(0, Math.min(255, Math.round(pixel.g)));
          outputArray[pos + 2] = Math.max(0, Math.min(255, Math.round(pixel.b)));
          if (channels === 4) {
            outputArray[pos + 3] = pixel.a;
          }
        }
      }

      // Save the processed image
      await sharp(outputArray, {
        raw: {
          width,
          height,
          channels,
        },
      })
        .png()
        .toBuffer((error, buffer) => {
          if (error) {
            reject(error);
          }

          resolve(buffer);
        });
    } catch (error) {
      console.error('Error processing image:', error);
      reject(error);
    }
  });
};

const inputFile = await Deno.readFile('screenshot.png');
const outputBuffer = await convertImageForThermalPrinter(inputFile);

await Deno.writeFile('processed2.png', outputBuffer);
