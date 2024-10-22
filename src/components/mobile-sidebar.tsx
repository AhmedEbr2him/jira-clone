'use client';

import { useEffect, useState } from 'react';

import { MenuIcon } from 'lucide-react';

import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Sidebar } from './sidebar';
import { usePathname } from 'next/navigation';

export const MobileSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathName = usePathname();

    useEffect(() => {
        setIsOpen(false);
    }, [pathName]);
    return (
        <Sheet
            modal={false}
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <SheetTrigger asChild>
                {/* asChild -> trigger become a button */}
                <Button
                    variant='secondary'
                    className='lg:hidden'
                >
                    <MenuIcon className='size-4 text-neutral-500' />
                </Button>
            </SheetTrigger>
            <SheetContent
                side='left'
                className='p-0'
            >
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
};