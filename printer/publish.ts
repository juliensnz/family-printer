import {takeScreenshot} from './src/screenshot';
import {ditherImage} from './src/dither';
import {config} from 'dotenv';
import {getPosts, publishImage} from './src/publish';

config();

const printerCreator = (printerName: string, serverUrl: string) => {
  return {
    printPendingPrints: async () => {
      console.log(`Printing pending prints for printer ${printerName}`);

      const posts = await getPosts(serverUrl, printerName);

      if (posts.length === 0) {
        console.log(`No pending posts for printer ${printerName}`);
      }

      for (const post of posts) {
        console.log(`Publishing post ${post.id} for printer ${printerName}`);
        const screenshot = await takeScreenshot(post.postUrl);
        const ditheredScreenshot = await ditherImage(screenshot);

        await publishImage(post, ditheredScreenshot);
      }
    },
  };
};

const printerName = process.env.PRINTER_NAME as string;
const serverUrl = process.env.SERVER_URL as string;
const printer = printerCreator(printerName, serverUrl);

(async () => {
  await printer.printPendingPrints();
})();
