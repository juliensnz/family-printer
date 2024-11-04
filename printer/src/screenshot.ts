import puppeteer from 'puppeteer-core';

const takeScreenshot = async (url: string) => {
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
      executablePath: process.platform === 'linux' ? '/usr/bin/chromium-browser' : undefined,
    });

    // Create a new page
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({
      width: 280,
      height: 0,
      deviceScaleFactor: 2,
    });

    console.log(`Taking a screenshot of: ${url}`);
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
    const image = await postToPrint.screenshot({});

    // Close browser
    await browser.close();

    return Buffer.from(image);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
};

export {takeScreenshot};
