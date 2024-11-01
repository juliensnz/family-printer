import puppeteer from 'puppeteer-core';

async function takeScreenshot(url: string) {
  try {
    // Launch browser with specific args needed for Raspberry Pi
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      channel: 'chrome',
      // Needed for Raspberry Pi
      // executablePath: '/usr/bin/chromium-browser',
    });

    // Create a new page
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: 300,
      height: 0,
      deviceScaleFactor: 2,
    });

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const postToPrint = await page.waitForSelector('.post-to-print', {timeout: 10000});

    if (!postToPrint) {
      throw new Error('Could not find post-to-print element');
    }

    // Take screenshot
    const image = await postToPrint.screenshot({
      // fullPage: true,
    });

    // Close browser
    await browser.close();

    return image;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
}

const image = await takeScreenshot('http://localhost:3001/en/guidel/81157975-6e71-460b-a894-0fb8491b203d?print=true');

await Deno.writeFile('screenshot.png', image);
