import {PrinterId} from '@/domain/model/Printer';
import {UserId} from '@/domain/model/User';

type ImageBlock = {
  type: 'image';
  url: string;
};

type TextBlock = {
  type: 'text';
  content: string;
};
type TitleBlock = {
  type: 'title';
  content: string;
};

type Block = ImageBlock | TextBlock | TitleBlock;

type PostId = string;

type Post = {
  id: PostId;
  printerId: PrinterId;
  author: {
    id: UserId;
    name: string;
    avatar: string;
  };
  date: number;
  printed: boolean;
  blocks: Block[];
};

export type {Post};
