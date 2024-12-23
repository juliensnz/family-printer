type Post = {
  id: string;
  printerId: string;
  postUrl: string;
  printUrl: string;
  ackUrl: string;
};

const getPosts = async (serverUrl: string, printerId: string): Promise<Post[]> => {
  const printsResponse = await fetch(`${serverUrl}/api/${printerId}/print`);

  const prints = await printsResponse.json();

  return prints as Post[];
};

const publishImage = async (post: Post, image: Buffer<ArrayBufferLike>) => {
  console.log(`Publishing post ${post.id} for printer ${post.printerId}`, image.byteLength);
};

export {getPosts, publishImage};
