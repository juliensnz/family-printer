import {db, storage} from '@/app/lib/firebase/backend';

const GET = async (_request: Request, {params: {printerId}}: {params: {printerId: string}}) => {
  const posts = await db.collection('printers').doc(printerId).collection('posts').where('printed', '==', false).get();
  const bucket = storage.bucket();

  const prints = await Promise.all(
    posts.docs.map(async doc => {
      const fileRef = bucket.file(doc.data().blocks[0].url);
      const signedUrl = await fileRef.getSignedUrl({action: 'read', expires: Date.now() + 1000 * 60 * 2});

      return {
        id: doc.id,
        printerId: doc.data().printerId,
        url: signedUrl,
      };
    })
  );

  return Response.json(prints);
};

const PUT = async (request: Request, {params: {printerId}}: {params: {printerId: string}}) => {
  const printId = (await request.json()).id;

  await db.collection('printers').doc(printerId).collection('posts').doc(printId).set({printed: true}, {merge: true});

  return new Response(null, {status: 201});
};

export {GET, PUT};
