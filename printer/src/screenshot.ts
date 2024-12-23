import puppeteer from 'puppeteer-core';

const takeLinuxScreenshot = async (url: string) => {
  const printUrl = `https://api.apiflash.com/v1/urltoimage?access_key=2005ab18953b4b7099c9eefb7565d80f&url=${encodeURIComponent(
    url
  )}&format=png&width=280&response_type=image&scale_factor=2&element=%5Bdata-id%5D`;

  console.log(printUrl);

  const response = await fetch(printUrl);

  if (!response.ok) {
    throw new Error('Failed to take screenshot');
  }

  const buffer = await response.arrayBuffer();

  return Buffer.from(buffer);
};

const takeMacOSScreenshot = async (url: string) => {
  try {
    // Launch browser with specific args needed for Raspberry Pi
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--start-fullscreen',
      ],
      headless: true,
      timeout: 60000,
      channel: 'chrome',
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
      timeout: 60000,
    });

    const postToPrint = await page.waitForSelector('.post-to-print', {timeout: 60000});

    if (!postToPrint) {
      throw new Error('Could not find post-to-print element');
    }

    await wait(30000);

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

const wait = async (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

const takeScreenshot = async (url: string) => {
  // if (process.platform === 'linux') {
  return takeLinuxScreenshot(url);
  // }

  // return takeMacOSScreenshot(url);
};

export {takeScreenshot};
