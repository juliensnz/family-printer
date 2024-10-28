import {Card, CardHeader, CardTitle, CardContent, CardFooter} from '@/components/ui/card';
import {Post} from '@/domain/model/Post';
import {Avatar, AvatarImage, AvatarFallback} from '@radix-ui/react-avatar';
import {storage} from '@/app/lib/firebase/backend';
import {getDownloadURL} from 'firebase-admin/storage';

const getImagePublicUrl = async (imageUrl: string) => {
  return await getDownloadURL(storage.bucket().file(imageUrl));
};

const PostDetails = async ({post}: {post: Post; printerId: string}) => {
  const title = post.blocks.find(block => block.type === 'title')?.content ?? 'Default title';
  const description = post.blocks.find(block => block.type === 'text')?.content ?? 'Default description';
  const image = post.blocks.find(block => block.type === 'image')?.url ?? 'Default image';

  if (undefined === description || undefined === image) {
    return null;
  }

  const imageUrl = await getImagePublicUrl(image);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {imageUrl && (
          <div className="relative w-full">
            <img src={imageUrl} alt="Post image" className="rounded-md w-full" />
          </div>
        )}
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.author.avatar} alt={post.author.name} className="rounded-full" />
            <AvatarFallback>
              {post.author.name
                .split(' ')
                .map(part => part.charAt(0))
                .join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{post.author.name}</span>
        </div>
        <time className="text-sm text-gray-500" dateTime={new Date(post.date).toISOString()}>
          {/* {format(new Date(post.date), 'PPpp')} */}
        </time>
      </CardFooter>
    </Card>
    // <div title={post.id} className="flex border rounded gap-2 m-2 p-2 flex-col">
    //   <h2 className="border-none outline-none w-full text-3xl">{title?.content}</h2>
    //   <p className="border-none outline-none w-full text-l">{description.content}</p>
    // </div>
  );
};

export {PostDetails};
