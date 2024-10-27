import {Button} from '@/components/ui/button';
import {createPost} from './_actions/createPost';

const Page = ({params: {printerId}}: {params: {printerId: string}}) => {
  return (
    <form action={createPost}>
      <label>Image</label>
      <input type="file" name="image" />
      <input type="hidden" name="printerId" value={printerId} />
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default Page;
