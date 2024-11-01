import {GET} from '@/app/api/[printerId]/print/route';
import {db} from '@/app/lib/firebase/backend';

const PUT = async (_request: Request, {params}: {params: Promise<{printerId: string; printId: string}>}) => {
  const {printerId, printId} = await params;

  await db.collection('printers').doc(printerId).collection('posts').doc(printId).set({printed: true}, {merge: true});

  return new Response(null, {status: 201});
};

export {PUT, GET};
