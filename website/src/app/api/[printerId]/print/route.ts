import {db} from '@/app/lib/firebase/backend';

const GET = async (request: Request, props: {params: Promise<{printerId: string}>}) => {
  const params = await props.params;

  const {printerId} = params;

  const posts = await db.collection('printers').doc(printerId).collection('posts').where('printed', '==', false).get();

  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  const prints = await Promise.all(
    posts.docs.map(async doc => {
      return {
        id: doc.id,
        printerId: doc.data().printerId,
        printUrl: `${protocol}://${host}/en/${printerId}/${doc.id}?print=true`,
        ackUrl: `${protocol}://${host}/api/${printerId}/print/${doc.id}`,
      };
    })
  );

  return Response.json(prints);
};

export {GET};
