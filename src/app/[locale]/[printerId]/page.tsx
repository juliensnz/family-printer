'use server';

import {CreatePost} from '@/app/[locale]/[printerId]/components/CreatePost/CreatePost';
import {ListPosts} from '@/app/[locale]/[printerId]/components/ListPosts/ListPosts';

const Page = async (props: {params: Promise<{printerId: string}>}) => {
  const params = await props.params;

  const {printerId} = params;

  return (
    <div>
      <ListPosts printerId={printerId} />
      <CreatePost printerId={printerId} />
    </div>
  );
};

export default Page;
