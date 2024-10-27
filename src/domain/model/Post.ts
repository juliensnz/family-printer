import {PrinterId} from '@/domain/model/Printer';
import {UserId} from '@/domain/model/User';

type ImageBlock = {
  type: 'image';
  url: string;
}

type TextBlock = {
  type: 'text';
  content: string;
}

type Block = ImageBlock | TextBlock

type PostId = string;

type Post = {
  id: PostId;
  printerId: PrinterId;
  userId: UserId;
  date: number;
  printed: boolean;
  blocks: Block[]
};

export type {Post}
