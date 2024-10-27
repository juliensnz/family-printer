import {CreatePost} from '@/app/[locale]/[printerId]/create/components/CreatePost';

const Page = async (props: {params: Promise<{printerId: string}>}) => {
  const params = await props.params;

  const {printerId} = params;

  return (
    <>
      <CreatePost printerId={printerId} />
    </>
  );
};

export default Page;
