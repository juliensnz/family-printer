'use client';

import {FormEvent, useState, useEffect} from 'react';
import Link from 'next/link';
import {auth, googleProvider} from '@/app/lib/firebase/frontend';
import {signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged} from 'firebase/auth';
import {useRouter, useSearchParams} from 'next/navigation';
import {useI18n} from '@/locales/client';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Loader2} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useI18n();

  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        console.log('user', user);
        console.log(redirectPath);
        router.push(redirectPath);
        console.log('redirected to', redirectPath);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, redirectPath]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(redirectPath);
    } catch (error) {
      console.error(t('error.logging_in'), error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('redirecting to', redirectPath);
      router.push(redirectPath);
    } catch (error) {
      console.error(t('error.logging_in_with_google'), error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t('button.login')}</CardTitle>
          <CardDescription>Enter your credentials to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="space-y-2">
              <Button type="submit" className="w-full">
                {t('button.login')}
              </Button>
              <Button type="button" onClick={handleGoogleLogin} variant="outline" className="w-full">
                {t('button.login_with_google')}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <span className="text-sm text-muted-foreground">
            {t('text.no_account')}{' '}
            <Link href="/signup" className="text-primary hover:underline">
              {t('button.sign_up')}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
