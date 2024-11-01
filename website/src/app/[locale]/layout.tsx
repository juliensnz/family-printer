import {ReactElement} from 'react';
import {I18nProviderClient} from '@/locales/client';
import {Viewport} from 'next';

export const viewport: Viewport = {
  themeColor: 'white',
  userScalable: false,
  viewportFit: 'cover',
  maximumScale: 1,
  initialScale: 1,
  width: 'device-width',
};

export default async function SubLayout(props: {params: Promise<{locale: string}>; children: ReactElement}) {
  const {children, params} = props;
  const {locale} = await params;

  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
}
