import {getPosts} from '@/app/[locale]/[printerId]/create/_actions/getPosts';
import {PostDetails} from './PostDetails';

const ListPosts = async ({printerId}: {printerId: string}) => {
  const posts = await getPosts(printerId);

  return (
    <div className="flex flex-col m-4 gap-4 pb-10">
      {posts.map(post => (
        <PostDetails key={post.id} post={post} printerId={printerId} />
      ))}
    </div>
  );
};

export {ListPosts};
