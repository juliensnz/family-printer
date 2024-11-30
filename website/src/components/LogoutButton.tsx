'use client';

import {useI18n} from '@/locales/client';
import {Button} from '@/components/ui/button';
import {useLogout} from '@/hooks/useLogout';

const LogoutButton = () => {
  const {handleLogout} = useLogout();
  const t = useI18n();

  return (
    <Button variant="outline" onClick={handleLogout}>
      {t('button.logout')}
    </Button>
  );
};

export {LogoutButton};
