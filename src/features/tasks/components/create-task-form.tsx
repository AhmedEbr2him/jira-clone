'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { useCreateTask } from '../api/use-create-task';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';

import { createTasksSchema } from '../schemas';
import { TaskStatus } from '../types';

import { DatePicker } from '@/components/date-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface CreateTaskFormProps {
	onCancel?: () => void;
	projectOptions: { id: string; name: string; imageUrl: string }[];
	memberOptions: { id: string; name: string }[];
}

export const CreateTaskForm = ({
	onCancel,
	projectOptions,
	memberOptions,
}: CreateTaskFormProps) => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();
	const { mutate, isPending } = useCreateTask();

	const form = useForm<z.infer<typeof createTasksSchema>>({
		resolver: zodResolver(createTasksSchema.omit({ workspaceId: true })),
		defaultValues: {
			workspaceId,
		},
	});

	const onSubmit = (values: z.infer<typeof createTasksSchema>) => {
		mutate(
			{ json: { ...values, workspaceId } },
			{
				onSuccess: () => {
					form.reset();
					onCancel?.();
				},
			}
		);
	};

	return (
		<Card className='w-full h-full border-none shadow-none'>
			<CardHeader className='flex p-7'>
				<CardTitle className='text-xl font-bold'>Create a new task</CardTitle>
			</CardHeader>

			<div className='px-7'>
				<DottedSeparator />
			</div>

			<CardContent className='p-7'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className='flex flex-col gap-y-4'>
							{/* FORM NAME */}
							<FormField
								name='name'
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Task Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder='Enter task name'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* DUE DATE PICKER */}
							<FormField
								name='dueDate'
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Due Date</FormLabel>
										<FormControl>
											<DatePicker {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* ASSIGNEE ID */}
							<FormField
								name='assigneeId'
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Assignee</FormLabel>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select Assignee' />
												</SelectTrigger>
											</FormControl>

											<FormMessage />
											<SelectContent>
												{memberOptions.map(member => (
													<SelectItem
														key={member.id}
														value={member.id}>
														<div className='flex items-center gap-x-2'>
															<MemberAvatar
																name={member.name}
																className='size-6'
															/>
															{member.name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							{/* STATUS */}
							<FormField
								name='status'
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select Status' />
												</SelectTrigger>
											</FormControl>

											<FormMessage />
											<SelectContent>
												<SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
												<SelectItem value={TaskStatus.IN_PROGRESS}>
													In Progress
												</SelectItem>
												<SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
												<SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
												<SelectItem value={TaskStatus.DONE}>Done</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							{/* PROJECT ID */}
							<FormField
								name='projectId'
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Project</FormLabel>
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select Project' />
												</SelectTrigger>
											</FormControl>

											<FormMessage />
											<SelectContent>
												{projectOptions.map(project => (
													<SelectItem
														key={project.id}
														value={project.id}>
														<div className='flex items-center gap-x-2'>
															<ProjectAvatar
																name={project.name}
																image={project.imageUrl}
																className='size-6'
															/>
															{project.name}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
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
									Add Task
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};
