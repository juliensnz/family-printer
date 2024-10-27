import {createPost} from '@/app/[locale]/[printerId]/create/_actions/createPost';
import {Button} from '@/components/ui/button';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card';
import {getI18n} from '@/locales/server';

const CreatePost = async ({printerId}: {printerId: string}) => {
  const t = await getI18n();

  return (
    <Card>
      <Form action={createPost}>
        <label>Image</label>
        <input type="file" name="image" />
        <input type="hidden" name="printerId" value={printerId} />
        <Button type="submit">Submit</Button>
      </Form>
      <CardHeader>
        <CardTitle>{t('post.create')}</CardTitle>
        <CardDescription>{t('post.description', {printerId})}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
};

export {CreatePost};
