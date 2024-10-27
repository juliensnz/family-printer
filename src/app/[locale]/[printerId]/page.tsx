'use server';

import {db} from '@/app/lib/firebase/backend';
import {Post} from '@/domain/model/Post';
import {Viewport} from 'next';

export const viewport: Viewport = {
  themeColor: 'white',
  userScalable: false,
  viewportFit: 'cover',
  maximumScale: 1,
  initialScale: 1,
  width: 'device-width',
};

const getPosts = async (): Promise<Post[]> => {
  const documents = await db.collection('posts').get();

  return documents.docs.map(doc => {
    return {
      id: doc.id,
      ...doc.data(),
    } as Post;
  });
};

const Page = async () => {
  const posts = await getPosts();

  return (
    <div>
      <h1>Printer Page</h1>
      <div>
        {posts.map(post => (
          <div key={post.id}>
            <h2>{post.id}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
