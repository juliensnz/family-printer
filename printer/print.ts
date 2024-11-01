const escpos = require('escpos');
// install escpos-usb adapter module manually
escpos.USB = require('escpos-usb');
// Select the adapter based on your printer type
const device = new escpos.USB(0x00, 0x05);
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

const options = {encoding: 'GB18030' /* default */};
// encoding is optional

const printer = new escpos.Printer(device, options);

device.open(function (error: unknown) {
  console.log(error);

  escpos.Image.load('processed.png', function (image: unknown) {
    printer
      .align('lt')
      .image(image)
      .then(() => {
        printer.cut();
        printer.close();
      });
  });
  // printer.image('screenshot.png').then(() => {
  //   printer.cut();
  //   printer.close();
  // });
  // .font('a')
  // .align('ct')
  // .style('bu')
  // .size(1, 1)
  // .text('The quick brown fox jumps over the lazy dog')
  // .text('敏捷的棕色狐狸跳过懒狗')
  // .barcode('1234567', 'EAN8')
  // .table(['One', 'Two', 'Three'])
  // .tableCustom(
  //   [
  //     {text: 'Left', align: 'LEFT', width: 0.33, style: 'B'},
  //     {text: 'Center', align: 'CENTER', width: 0.33},
  //     {text: 'Right', align: 'RIGHT', width: 0.33},
  //   ],
  //   {encoding: 'cp857', size: [1, 1]} // Optional
  // )
  // .qrimage('https://github.com/song940/node-escpos', function (error: unknown) {
  //   console.log(error);
  //   // @ts-ignore
  //   this.cut();
  //   // @ts-ignore
  //   this.close();
  // });
});
