const escpos = require('escpos');
// install escpos-usb adapter module manually
escpos.USB = require('escpos-usb');
// Select the adapter based on your printer type

const publish = (path: string) => {
  const device = new escpos.USB(0x00, 0x05);
  // const device  = new escpos.Network('localhost');
  // const device  = new escpos.Serial('/dev/usb/lp0');

  const options = {encoding: 'GB18030' /* default */};
  // encoding is optional

  const printer = new escpos.Printer(device, options);
  device.open(function (error: unknown) {
    escpos.Image.load(path, function (image: unknown) {
      printer
        .align('lt')
        .image(image)
        .then(() => {
          printer.cut();
          printer.close();
        });
    });
  });
};

export {publish};
