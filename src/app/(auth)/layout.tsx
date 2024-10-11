'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
}
const AuthLayout = ({ children }: AuthLayoutProps) => {
    const pathName = usePathname();
    const isSignIn = pathName === '/sign-in';

    return (
        <main className='bg-neutral-100 min-h-screen'>
            <div className='mx-auto max-w-screen-2xl p-4'>
                <nav className='flex justify-between items-center'>
                    <Image
                        alt='logo'
                        src='/logo.svg'
                        height={56}
                        width={152}
                    />

                    <Button
                        variant='secondary'
                        className=''
                        asChild
                    >
                        <Link href={isSignIn ? '/sign-up' : '/sign-in'}>
                            {isSignIn ? 'Sign Up' : 'Login'}
                        </Link>
                    </Button>
                </nav>
                <div className='flex items-center justify-center pt-4 md:pt-12'>{children}</div>
            </div>
        </main>
    );
};

export default AuthLayout;
