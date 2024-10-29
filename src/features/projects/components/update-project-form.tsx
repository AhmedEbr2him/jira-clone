'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

import Image from 'next/image';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { ArrowLeft, ImageIcon } from 'lucide-react';

import { updateProjectSchema } from '../schemas';
import { Project } from '../types';

import { useDeleteProject } from '../api/use-delete-project';
import { useUpdateProject } from '../api/use-update-project';
import { useConfirm } from '@/hooks/use-confirm';

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

interface UpdateProjectForm {
	onCancel?: () => void;
	initialValues: Project;
}

export const UpdateProjectForm = ({ onCancel, initialValues }: UpdateProjectForm) => {
	const router = useRouter();

	const { mutate: updateProject, isPending: isUpdatingProjectPending } = useUpdateProject();

	const { mutate: deleteProject, isPending: isDeletingProjectPending } = useDeleteProject();

	const [DeleteDiaglog, confirmDelete] = useConfirm(
		'Delete Project',
		'Are you sure to delete this project? This action cannot be undone.',
		'destructive'
	);

	const inputRef = useRef<HTMLInputElement>(null);

	const form = useForm<z.infer<typeof updateProjectSchema>>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: {
			...initialValues,
			image: initialValues.imageUrl ?? '',
		},
	});
	// SUBMITTING FORM
	const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
		const finalValues = {
			...values,
			image: values?.image instanceof File ? values?.image : '',
		};

		updateProject(
			{
				form: finalValues,
				param: { projectId: initialValues.$id },
			},
			{
				onSuccess: () => {
					router.push(
						`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`
					);
					form.reset();
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

	// DELETING PROJECT
	const handleDeleteWorkspace = async () => {
		const ok = await confirmDelete();

		if (!ok) return;

		deleteProject(
			{
				param: { projectId: initialValues.$id },
			},
			{
				onSuccess: () => {
					window.location.href = `/workspaces/${initialValues.workspaceId}`; // hard refresh to delete any workspaceId cached instead of router.
				},
			}
		);
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
							onCancel
								? onCancel
								: () =>
										router.push(
											`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`
										)
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
											<FormLabel>Project Name</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder='Enter project name'
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
													<p className='text-sm font-medium'>Project Icon</p>
													<p className='text-sm text-muted-foreground'>
														JPG, JPEG, PNG or SVG, max 1mb
													</p>

													<input
														type='file'
														accept='.jpg, .jpeg, .png, .svg'
														className='hidden'
														ref={inputRef}
														onChange={handleImageChange}
														disabled={isUpdatingProjectPending}
													/>
													{field.value ? (
														<Button
															type='button'
															disabled={isUpdatingProjectPending}
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
															disabled={isUpdatingProjectPending}
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
										disabled={isUpdatingProjectPending}
										type='button'
										size='lg'
										variant='secondary'
										onClick={onCancel}
										className={cn(!onCancel && 'invisible')}>
										Cancel
									</Button>

									<Button
										disabled={isUpdatingProjectPending}
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
						<DottedSeparator className='py-7' />

						<Button
							size='sm'
							variant='destructive'
							type='button'
							disabled={isUpdatingProjectPending || isDeletingProjectPending}
							className='mt-6 w-fit ml-auto'
							onClick={handleDeleteWorkspace}>
							Delete Project
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
