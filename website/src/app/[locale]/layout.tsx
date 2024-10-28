import {ReactElement} from 'react';
import {I18nProviderClient} from '@/locales/client';

export default async function SubLayout(props: {params: Promise<{locale: string}>; children: ReactElement}) {
  const {children, params} = props;
  const {locale} = await params;

  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
}
