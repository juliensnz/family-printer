import {db, storage} from '@/app/lib/firebase/backend';

const GET = async (_request: Request, {params}: {params: Promise<{printerId: string; printId: string}>}) => {
  const {printerId, printId} = await params;

  const bucket = storage.bucket();
  const fileRef = bucket.file(`printers/${printerId}/prints/${printId}.png`);

  if (!(await fileRef.exists())[0]) {
    return new Response(null, {status: 404});
  }

  const [url] = await fileRef.getSignedUrl({action: 'read', expires: Date.now() + 15 * 60 * 1000});

  return new Response(null, {status: 302, headers: {Location: url}});
};

const PUT = async (_request: Request, {params}: {params: Promise<{printerId: string; printId: string}>}) => {
  const {printerId, printId} = await params;

  await db.collection('printers').doc(printerId).collection('posts').doc(printId).set({printed: true}, {merge: true});

  return new Response(null, {status: 201});
};

export {PUT, GET};
