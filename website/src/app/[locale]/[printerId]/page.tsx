'use server';

import {CreatePost} from '@/app/[locale]/[printerId]/components/CreatePost/CreatePost';
import {ListPosts} from '@/app/[locale]/[printerId]/components/ListPosts/ListPosts';

const Page = async (props: {params: Promise<{printerId: string; locale: string}>}) => {
  const params = await props.params;

  const {printerId, locale} = params;

  return (
    <div>
      <ListPosts printerId={printerId} />
      <CreatePost printerId={printerId} locale={locale} />
    </div>
  );
};

export default Page;
