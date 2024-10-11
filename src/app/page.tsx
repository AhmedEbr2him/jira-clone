import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
    return (
        <div className='flex  flex-wrap'>
            <Input />
            <Button
                className='flex gap-4'
                variant='primary'
                size='lg'
            >
                Primary
            </Button>
            <Button
                className='flex gap-4'
                variant='secondary'
            >
                Secondary
            </Button>
            <Button
                className='flex gap-4'
                variant='destructive'
            >
                Destructive
            </Button>
            <Button
                className='flex gap-4'
                variant='ghost'
            >
                Ghost
            </Button>
            <Button
                className='flex gap-4'
                variant='muted'
            >
                Muted
            </Button>
            <Button
                className='flex gap-4'
                variant='outline'
            >
                Outline
            </Button>
            <Button
                className='flex gap-4'
                variant='teritary'
            >
                Teritary
            </Button>
        </div>
    );
}
