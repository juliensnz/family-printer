'use server';

import {db} from '@/app/lib/firebase/backend';

type Printer = {
  id: string;
  name: string;
};

export async function getPrinters(): Promise<Printer[]> {
  const printersSnapshot = await db.collection('printers').get();

  return printersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Printer[];
}
