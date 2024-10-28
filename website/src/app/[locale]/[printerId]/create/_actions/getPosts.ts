import {db} from '@/app/lib/firebase/backend';
import {Post} from '@/domain/model/Post';

const getPosts = async (printerId: string): Promise<Post[]> => {
  const documents = await db.collection('printers').doc(printerId).collection('posts').orderBy('date', 'desc').get();

  return documents.docs.map(doc => {
    return {
      id: doc.id,
      ...doc.data(),
    } as Post;
  });
};

export {getPosts};
