import 'jsr:@std/dotenv/load';

const printerCreator = (printerName: string, serverUrl: string) => {
  return {
    printPendingPrints: async () => {
      console.log(`Printing pending prints for printer ${printerName}`);

      const printsResponse = await fetch(`${serverUrl}/api/${printerName}/print`);

      const prints = await printsResponse.json();

      if (prints.length === 0) {
        console.log(`No pending prints for printer ${printerName}`);
      }

      for (const print of prints) {
        console.log(`Printing print ${print.id} for printer ${printerName}: ${print.url}`);

        await fetch(`${serverUrl}/api/${printerName}/print/${print.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    },
  };
};

const printerName = Deno.env.get('PRINTER_NAME') as string;
const serverUrl = Deno.env.get('SERVER_URL') as string;
const printer = printerCreator(printerName, serverUrl);

await printer.printPendingPrints();
