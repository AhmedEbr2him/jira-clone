import { useState } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveModal } from '@/components/responsive-modal';

export const useConfirm = (
	title: string,
	message: string,
	variant: ButtonProps['variant'] = 'primary'
): [() => JSX.Element, () => Promise<unknown>] => {
	const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

	const confirm = () => {
		return new Promise(resolve => {
			setPromise({ resolve });
		});
	};
	const handleClose = () => {
		setPromise(null);
	};

	const handleConfirm = () => {
		promise?.resolve(true);
		handleClose();
	};

	const handleCancel = () => {
		promise?.resolve(false);
		handleClose();
	};

	const ConfirmationDialog = () => (
		<ResponsiveModal
			open={promise !== null} /* Open if promise is not null */
			onOpenChange={handleClose}>
			<Card className='w-full h-full border-none shadow-none'>
				<CardContent className='pt-8'>
					<CardHeader>
						<CardTitle className='p-0'>{title}</CardTitle>
						<CardDescription>{message}</CardDescription>
					</CardHeader>

					<div className='pt-4 w-full flex flex-col items-center justify-end gap-y-2 lg:flex-row gap-x-2'>
						<Button
							variant='outline'
							onClick={handleCancel}
							className='w-full lg:w-auto'>
							Cancel
						</Button>
						<Button
							variant={variant}
							onClick={handleConfirm}
							className='w-full lg:w-auto'>
							Confirm
						</Button>
					</div>
				</CardContent>
			</Card>
		</ResponsiveModal>
	);

	return [ConfirmationDialog, confirm];
};
