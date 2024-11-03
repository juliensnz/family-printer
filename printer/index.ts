import {takeScreenshot} from './src/screenshot';
import {ditherImage} from './src/dither';
import {saveImage} from './src/fs';
import {publish} from './src/printer';
import {getPrints, acknowledgePrint} from './src/prints';
import {config} from 'dotenv';

config();

const printerCreator = (printerName: string, serverUrl: string) => {
  return {
    printPendingPrints: async () => {
      console.log(`Printing pending prints for printer ${printerName}`);

      const prints = await getPrints(serverUrl, printerName);

      if (prints.length === 0) {
        console.log(`No pending prints for printer ${printerName}`);
      }

      for (const print of prints) {
        console.log(`Printing print ${print.id} for printer ${printerName}`);
        const screenshot = await takeScreenshot(print.printUrl);
        const ditheredScreenshot = await ditherImage(screenshot);
        const printPath = `./prints/${print.printerId}_${print.id}.png`;
        await saveImage(ditheredScreenshot, printPath);

        await publish(printPath);

        await acknowledgePrint(serverUrl, printerName, print.id);
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
