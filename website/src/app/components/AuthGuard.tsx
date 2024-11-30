'use client';

import {useAuth} from '@/app/context/AuthContext';
import {Loader} from '@/components/ui/loader';
import {redirect, usePathname} from 'next/navigation';
import {ReactNode} from 'react';

type AuthGuardProps = {
  children: ReactNode;
  locale: string;
};

const AuthGuard = ({locale, children}: AuthGuardProps) => {
  const {user, loading} = useAuth();
  const pathname = usePathname();

  const publicPages = [`/${locale}/login`, `/${locale}/signup`];
  const isPublicPage = publicPages.includes(pathname);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  if (!user && !isPublicPage) {
    redirect(`/${locale}/login`);
  }

  return children;
};

export {AuthGuard};
