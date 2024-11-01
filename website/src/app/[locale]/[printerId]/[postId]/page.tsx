'use server';

import {PostDetails} from '@/app/[locale]/[printerId]/components/ListPosts/PostDetails';
import {getPost} from '@/app/[locale]/[printerId]/create/_actions/getPosts';

const Page = async (props: {
  params: Promise<{printerId: string; postId: string}>;
  searchParams: Promise<{print: string}>;
}) => {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const {printerId, postId} = params;
  const {print} = searchParams;

  const post = await getPost(printerId, postId);

  if (print !== undefined) {
    return <PostDetails post={post} printerId={printerId} printMode={true} />;
  }

  return (
    <div className="flex column p-4">
      <PostDetails post={post} printerId={printerId} />
    </div>
  );
};

export default Page;
