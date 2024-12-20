'use client';

import {Textarea} from './Textarea';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';

import {useMediaQuery} from '@/hooks/useMediaQuery';
import {useI18n} from '@/locales/client';
import {ChangeEvent, ChangeEventHandler, useActionState, useEffect, useRef, useState} from 'react';
import {ImagePlus, LoaderCircle, Plus, Send} from 'lucide-react';
import {cn} from '@/lib/utils';
import {createPost} from '@/app/[locale]/[printerId]/create/_actions/createPost';

const CreateButton = ({className, ...props}: {className?: string}) => {
  const t = useI18n();

  return (
    <Button
      variant="outline"
      className={cn('group rounded-full fixed bottom-3 right-3 p-7 flex gap-4', className)}
      {...props}
    >
      <Plus className="scale-150" />
      <span className="text-xl">{t('post.open')}</span>
    </Button>
  );
};

const TitleInput = ({value, onChange}: {value: string; onChange: ChangeEventHandler<HTMLInputElement>}) => {
  const t = useI18n();

  return (
    <input
      required
      name="title"
      value={value}
      onChange={onChange}
      className="border-none outline-none w-full text-xl"
      type="text"
      placeholder={t('post.create')}
    />
  );
};

const SubmitButton = ({loading}: {loading: boolean}) => {
  return (
    <Button type={loading ? 'button' : 'submit'}>
      {loading ? <LoaderCircle className="animate-spin" /> : <Send />}
      Submit
    </Button>
  );
};

const ImageInput = ({onChange}: {onChange: () => void}) => {
  const [id] = useState(() => Math.random().toString(36).substring(7));
  const t = useI18n();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange();
    }
  };

  return (
    <div className="mb-4 mt-2">
      <label htmlFor={id} className="flex w-full align-middle justify-center">
        {preview ? (
          <img alt="test" src={preview} className="max-h-72 rounded" />
        ) : (
          <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
            <ImagePlus />
            {t('post.image.add')}
          </span>
        )}
      </label>
      <input
        className="hidden"
        type="file"
        name="image"
        id={id}
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />
    </div>
  );
};

const CreatePost = ({printerId, locale}: {printerId: string; locale: string}) => {
  const t = useI18n();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [state, formAction, loading] = useActionState(createPost, {title: '', description: '', saved: false});
  const [formData, setFormData] = useState({title: '', description: ''});
  const ref = useRef<HTMLDivElement>(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const {name, value} = event.target;

    setFormData(prev => ({...prev, [name]: value}));
  };

  useEffect(() => {
    if (state.saved) {
      setOpen(false);
      setFormData({title: '', description: ''});
    }
  }, [state.saved]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <CreateButton />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" ref={ref}>
          <form action={formAction}>
            <DialogHeader>
              <DialogTitle>
                <TitleInput onChange={handleChange} value={formData.title} />
              </DialogTitle>
              <DialogDescription>
                <Textarea
                  name="description"
                  placeholder={t('post.description', {printerId})}
                  value={formData.description}
                  onChange={handleChange}
                />
              </DialogDescription>
              <ImageInput onChange={() => {}} />
            </DialogHeader>
            <input type="hidden" name="printerId" value={printerId} />
            <input type="hidden" name="locale" value={locale} />
            <SubmitButton loading={loading} />
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <CreateButton />
      </DrawerTrigger>
      <DrawerContent ref={ref}>
        <form action={formAction}>
          <DrawerHeader className="text-left">
            <DrawerTitle>
              <TitleInput value={formData.title} onChange={handleChange} />
            </DrawerTitle>
            <DrawerDescription>
              <Textarea
                name="description"
                placeholder={t('post.description', {printerId})}
                onChange={handleChange}
                value={formData.description}
              />
            </DrawerDescription>
            <ImageInput
              onChange={() => {
                setTimeout(() => {
                  let height = 0;

                  ref.current?.childNodes.forEach(node => {
                    if (node instanceof HTMLElement) {
                      height += node.getBoundingClientRect().height;
                    }
                  });
                  ref.current?.style.setProperty('height', `${height + 20}px`);
                }, 100);
              }}
            />
          </DrawerHeader>
          <input type="hidden" name="printerId" value={printerId} />
          <input type="hidden" name="locale" value={locale} />
          <DrawerFooter className="pt-2">
            <SubmitButton loading={loading} />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export {CreatePost};
