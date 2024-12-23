import {executeCommand} from './command';

const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const macOSpublish = async (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const device = new escpos.USB(0x00, 0x05);
      const options = {encoding: 'GB18030'};
      const printer = new escpos.Printer(device, options);

      device.open(async (error: Error | null) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          const image = await new Promise((resolveImage, rejectImage) => {
            escpos.Image.load(path, (err: Error | null, loadedImage: unknown) => {
              if (err) rejectImage(err);
              else resolveImage(loadedImage);
            });
          });

          await printer.align('lt').image(image);

          printer.cut();
          printer.close();
          resolve();
        } catch (err) {
          printer.close();
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

const linuxPublish = async (path: string): Promise<void> => {
  await executeCommand(`python src/printer.py ${path}`);
};

const publish = async (path: string): Promise<void> => {
  if (process.platform === 'darwin') {
    await macOSpublish(path);
  } else if (process.platform === 'linux') {
    await linuxPublish(path);
  } else {
    throw new Error('Unsupported platform');
  }
};

export {publish};
