import {ReactElement} from 'react';
import {I18nProviderClient} from '@/locales/client';
import {Viewport} from 'next';
import {Header} from '@/components/Header';
import {AuthGuard} from '@/app/components/AuthGuard';

export const viewport: Viewport = {
  themeColor: 'white',
  userScalable: false,
  viewportFit: 'cover',
  maximumScale: 1,
  initialScale: 1,
  width: 'device-width',
};

const SubLayout = async (props: {params: Promise<{locale: string}>; children: ReactElement}) => {
  const {children, params} = props;
  const {locale} = await params;

  return (
    <I18nProviderClient locale={locale}>
      <AuthGuard locale={locale}>
        <Header />
        <main className="pt-16">{children}</main>
      </AuthGuard>
    </I18nProviderClient>
  );
};

export default SubLayout;
