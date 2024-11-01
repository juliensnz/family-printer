'use client';

import {screenshot} from '@/app/lib/image/screenshot';
import {DrawerTrigger, DrawerContent, DrawerHeader, Drawer, DrawerTitle} from '@/components/ui/drawer';
import {useState} from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {Eye, LoaderCircle} from 'lucide-react';

const Preview = ({postId}: {postId: string; className?: string}) => {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  return (
    <Drawer
      onOpenChange={async () => {
        setLoading(true);
        setData((await screenshot(`post_${postId}`)) ?? null);
      }}
    >
      <DrawerTrigger>
        <Eye className="text-gray-500" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <VisuallyHidden.Root>
            <DrawerTitle>Post preview</DrawerTitle>
          </VisuallyHidden.Root>
          {isLoading ? (
            <div className="w-full h-96 flex items-center justify-center">
              <LoaderCircle className="w-8 h-8 animate-spin" aria-label="Loading" />
            </div>
          ) : null}
          {data !== null ? <img src={data} alt="screenshot" onLoad={() => setLoading(false)} /> : null}
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export {Preview};
