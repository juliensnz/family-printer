'use client';

import {useLogout} from '@/hooks/useLogout';
import {DropdownMenuItem} from '@/components/ui/dropdown-menu';
import {useI18n} from '@/locales/client';

const LogoutMenuItem = () => {
  const {handleLogout} = useLogout();
  const t = useI18n();

  return <DropdownMenuItem onClick={handleLogout}>{t('header.logout')}</DropdownMenuItem>;
};

export {LogoutMenuItem};
