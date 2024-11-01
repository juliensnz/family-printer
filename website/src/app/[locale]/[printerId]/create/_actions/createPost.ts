'use server';
import {db, storage} from '@/app/lib/firebase/backend';
import {Post} from '@/domain/model/Post';
import {randomUUID} from 'crypto';
import {revalidatePath} from 'next/cache';

const createPost = async (previousState: object, formData: FormData) => {
  const postUUID = randomUUID();

  const file = formData.get('image') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const printerId = formData.get('printerId') as string;
  const locale = formData.get('locale') as string;

  const fileUUID = randomUUID();
  const fileUrl = `printers/${printerId}/posts/${postUUID}/images/${fileUUID}`;
  const bucket = storage.bucket();
  const fileRef = bucket.file(fileUrl);

  await fileRef.save(Buffer.from(await file.arrayBuffer()));

  const newPost: Post = {
    id: postUUID,
    printerId,
    author: {
      id: 'julien',
      name: 'Julien Sanchez',
      avatar: 'https://lh3.googleusercontent.com/ogw/AF2bZyjBMTyqWOXsmPNgs-t8tNmzOJI60CobClc0WKkVyiKmGw1f=s64-c-mo',
    },
    date: Date.now(),
    printed: false,
    blocks: [
      {type: 'title', content: title},
      {type: 'text', content: description},
      {
        type: 'image',
        url: fileUrl,
      },
    ],
  };

  await db.collection('printers').doc(printerId).collection('posts').doc(postUUID).set(newPost);

  revalidatePath(`/${locale}/${printerId}`);

  return {
    ...previousState,
    title,
    description,
    saved: true,
  };
};

export {createPost};
