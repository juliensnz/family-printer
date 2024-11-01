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

const getPost = async (printerId: string, postId: string): Promise<Post> => {
  const document = await db.collection('printers').doc(printerId).collection('posts').doc(postId).get();

  return {
    id: document.id,
    ...document.data(),
  } as Post;
};

export {getPosts, getPost};
