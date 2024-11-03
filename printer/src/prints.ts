type Print = {
  id: string;
  printerId: string;
  printUrl: string;
  ackUrl: string;
};

const getPrints = async (serverUrl: string, printerId: string): Promise<Print[]> => {
  const printsResponse = await fetch(`${serverUrl}/api/${printerId}/print`);

  const prints = await printsResponse.json();

  return prints as Print[];
};

const acknowledgePrint = async (serverUrl: string, printerId: string, printId: string) => {
  await fetch(`${serverUrl}/api/${printerId}/print/${printId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export {getPrints, acknowledgePrint};
