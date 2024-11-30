'use client';

import {useState} from 'react';
import Link from 'next/link';
import {auth} from '@/app/lib/firebase/frontend';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {useRouter} from 'next/navigation';
import {useI18n} from '@/locales/client';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const t = useI18n();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      console.error(t('error.signing_up'), error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t('button.sign_up')}</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('placeholder.email')}
              />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('placeholder.password')}
              />
            </div>
            <Button type="submit" className="w-full">
              {t('button.sign_up')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <span className="text-sm text-muted-foreground">
            {t('text.have_account')}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {t('button.login')}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
