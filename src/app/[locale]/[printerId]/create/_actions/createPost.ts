'use server';
import {db, storage} from '@/app/lib/firebase/backend';
import {Post} from '@/domain/model/Post';
import {randomUUID} from 'crypto';

const createPost = async (formData: FormData) => {
  const postUUID = randomUUID();

  const file = formData.get('image') as File;
  const printerId = formData.get('printerId') as string;

  const fileUUID = randomUUID();
  const fileUrl = `printers/${printerId}/posts/${postUUID}/images/${fileUUID}`;
  const bucket = storage.bucket();
  const fileRef = bucket.file(fileUrl);

  console.log(fileUrl);

  await fileRef.save(Buffer.from(await file.arrayBuffer()));

  const newPost: Post = {
    id: postUUID,
    printerId,
    userId: 'julien',
    date: Date.now(),
    printed: false,
    blocks: [
      {
        type: 'image',
        url: fileUrl,
      },
    ],
  };

  await db.collection('printers').doc(printerId).collection('posts').doc(postUUID).set(newPost);
};

export {createPost};
