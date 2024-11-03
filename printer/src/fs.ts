import fs from 'fs/promises';

const saveImage = async (image: Buffer, path: string) => {
  await fs.writeFile(path, image);
};

export {saveImage};
