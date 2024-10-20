'use client';

import { z } from 'zod';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DottedSeparator } from '@/components/dotted-separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';

import { createWorkspacesSchema } from '../schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateWorkSpace } from '../api/use-create-workspace';

interface CreateWorkspaceFormProps {
	onCancel?: () => void;
}

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
	const { mutate, isPending } = useCreateWorkSpace();

	const inputRef = useRef<HTMLInputElement>(null);

	const form = useForm<z.infer<typeof createWorkspacesSchema>>({
		resolver: zodResolver(createWorkspacesSchema),
		defaultValues: {
			name: '',
		},
	});

	const onSubmit = (values: z.infer<typeof createWorkspacesSchema>) => {
		const finalValues = {
			...values,
			image: values?.image instanceof File ? values?.image : '',
		};

		mutate(
			{ form: finalValues },
			{
				onSuccess: () => {
					form.reset();
					// TODO: REDIRECT TO NEW WORK SAPCE
				},
			}
		);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target?.files?.[0];

		if (file) {
			form.setValue('image', file);
		}
	};
	return (
		<Card className='w-full h-full border-none shadow-none'>
			<CardHeader className='flex p-7'>
				<CardTitle className='text-xl font-bold'>Create a new work space</CardTitle>
			</CardHeader>

			<div className='px-7'>
				<DottedSeparator />
			</div>

			<CardContent className='p-7'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className='flex flex-col gap-y-4'>
							<FormField
								name='name'
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Workspace Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder='Enter workspace name'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name='image'
								control={form.control}
								render={({ field }) => (
									<div className='flex flex-col gap-y-2'>
										<div className='flex items-center gap-x-5'>
											{field.value ? (
												<div className='size-[72px] relative rounded-md overflow-hidden'>
													<Image
														alt='Logo'
														fill
														className='object-cover'
														src={
															field.value instanceof File
																? URL.createObjectURL(field.value)
																: field.value
														}
													/>
												</div>
											) : (
												<Avatar className='size-[72px]'>
													<AvatarFallback>
														<ImageIcon className='size-[36px] text-neutral-400' />
													</AvatarFallback>
												</Avatar>
											)}

											<div className='flex flex-col'>
												<p className='text-sm font-medium'>Workspace Icon</p>
												<p className='text-sm text-muted-foreground'>
													JPG, JPEG, PNG or SVG, max 1mb
												</p>

												<input
													type='file'
													accept='.jpg, .jpeg, .png, .svg'
													className='hidden'
													ref={inputRef}
													onChange={handleImageChange}
													disabled={isPending}
												/>
												<Button
													type='button'
													disabled={isPending}
													variant='teritary'
													size='xs'
													className='w-fit mt-2'
													onClick={() => inputRef.current?.click()}
												>
													Upload Image
												</Button>
											</div>
										</div>
									</div>
								)}
							/>
							<DottedSeparator className='py-7' />
							<div className='flex items-center justify-between'>
								<Button
									disabled={isPending}
									type='button'
									size='lg'
									variant='secondary'
									onClick={onCancel}
								>
									Cancel
								</Button>
								<Button
									disabled={isPending}
									size='lg'
									variant='primary'
								>
									Create Workspace
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
