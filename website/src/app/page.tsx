import {Viewport} from 'next';

export const viewport: Viewport = {
  themeColor: 'white',
  userScalable: false,
  viewportFit: 'cover',
  maximumScale: 1,
  initialScale: 1,
  width: 'device-width',
};

export default function Home() {
  return <div></div>;
}
