'use client';
import { useCurrent } from '@/features/auth/api/use-current';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function Home() {
    const router = useRouter();
    const { data, isLoading } = useCurrent();

    useEffect(() => {
        if (!data && !isLoading) {
            router.push('/sign-in');
        }
    }, [data, isLoading, router]);
    return <div className=''>Only visible to authorized users</div>;
}
