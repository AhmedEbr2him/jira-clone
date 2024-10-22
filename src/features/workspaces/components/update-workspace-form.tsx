'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

import Image from 'next/image';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useUpdateWorkspace } from '../api/use-update-workspace';

import { ArrowLeft, ImageIcon } from 'lucide-react';

import { updateWorkspacesSchema } from '../schemas';
import { Workspace } from '../types';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DottedSeparator } from '@/components/dotted-separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useConfirm } from '@/hooks/use-confirm';
import { useDeleteWorkspace } from '../api/use-delete-workspace';

interface UpdateWorkspaceFormProps {
	onCancel?: () => void;
	initialValues: Workspace;
}

export const UpdateWorkspaceForm = ({ onCancel, initialValues }: UpdateWorkspaceFormProps) => {
	const router = useRouter();

	const { mutate, isPending } = useUpdateWorkspace();

	const { mutate: deleteWrokspace, isPending: isDeleteingWorkspacePending } = useDeleteWorkspace();

	const [DeleteDiaglog, confirmDelete] = useConfirm(
		'Delete Workspace',
		'Are you sure to delete this workspace? This action cannot be undone.',
		'destructive'
	);
	const inputRef = useRef<HTMLInputElement>(null);

	const form = useForm<z.infer<typeof updateWorkspacesSchema>>({
		resolver: zodResolver(updateWorkspacesSchema),
		defaultValues: {
			...initialValues,
			image: initialValues.imageUrl ?? '',
		},
	});

	// DELETING WORKSPACE
	const handleDeleteWorkspace = async () => {
		const ok = await confirmDelete();

		if (!ok) return;

		deleteWrokspace(
			{
				param: { workspaceId: initialValues.$id },
			},
			{
				onSuccess: () => {
					window.location.href = '/'; // hard refresh to delete any workspaceId cached instead of router.push("/")
				},
			}
		);
	};

	// SUBMITTING FORM
	const onSubmit = (values: z.infer<typeof updateWorkspacesSchema>) => {
		const finalValues = {
			...values,
			image: values?.image instanceof File ? values?.image : '',
		};

		mutate(
			{
				form: finalValues,
				param: { workspaceId: initialValues.$id },
			},
			{
				onSuccess: ({ data }) => {
					form.reset();
					router.push(`/workspaces/${data.$id}`);
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
		<div className='flex flex-col gap-y-4'>
			<DeleteDiaglog />
			<Card className='w-full h-full border-none shadow-none'>
				<CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'>
					<Button
						size='sm'
						variant='secondary'
						onClick={
							onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)
						}>
						<ArrowLeft className='size-4 mr-2' />
						Back
					</Button>
					<CardTitle className='text-xl font-bold'>{initialValues.name}</CardTitle>
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
													{field.value ? (
														<Button
															type='button'
															disabled={isPending}
															variant='destructive'
															size='xs'
															className='w-fit mt-2'
															onClick={() => {
																field.onChange(null);
																if (inputRef.current) {
																	inputRef.current.value = '';
																}
															}}>
															Remove Image
														</Button>
													) : (
														<Button
															type='button'
															disabled={isPending}
															variant='teritary'
															size='xs'
															className='w-fit mt-2'
															onClick={() => inputRef.current?.click()}>
															Upload Image
														</Button>
													)}
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
										className={cn(!onCancel && 'invisible')}>
										Cancel
									</Button>

									<Button
										disabled={isPending}
										size='lg'
										variant='primary'>
										Save Changes
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			<Card className='w-full h-full border-none shadow-none'>
				<CardContent className='p-7'>
					<div className='flex flex-col'>
						<h3 className='font-bold'>Danger Zone</h3>
						<p className='text-sm text-muted-foreground'>
							Deleting a workspace is a irreversible and will remove all associated data.
						</p>
						<Button
							size='sm'
							variant='destructive'
							type='button'
							disabled={isDeleteingWorkspacePending}
							className='mt-6 w-fit ml-auto'
							onClick={handleDeleteWorkspace}>
							Delete Workspace
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
