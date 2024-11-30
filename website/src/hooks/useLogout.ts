import {auth} from '@/app/lib/firebase/frontend';
import {signOut} from 'firebase/auth';

const useLogout = () => {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return {handleLogout};
};

export {useLogout};
