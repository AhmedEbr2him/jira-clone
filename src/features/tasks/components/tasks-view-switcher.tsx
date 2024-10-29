'use client';

import { Loader, PlusIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DataFilters } from './data-filter';

import { useTaskFilters } from '../hooks/use-task-filters';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { useGetTasks } from '../api/use-get-tasks';

export const TaskViewSwitcher = () => {
	const [{ projectId, assigneeId, status, search, dueDate }] = useTaskFilters();

	const { open } = useCreateTaskModal();

	const [view, setView] = useQueryState('task-view', {
		defaultValue: 'table',
	}); // table | kanban | calendar

	const workspaceId = useWorkspaceId();
	const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
		workspaceId,
		projectId,
		assigneeId,
		status, // FROM useQueryStatus
		dueDate,
	}); // BACKLOG || INPROGRESS ||...STATUS

	return (
		<Tabs
			defaultValue={view}
			onValueChange={setView}
			className='flex-1 w-full border rounded-lg'>
			<div className='h-full flex flex-col overflow-auto p-4'>
				<div className='flex flex-col gap-y-2 lg:flex-row justify-between items-center'>
					<TabsList className='w-full lg:w-auto'>
						<TabsTrigger
							className='h-8 w-full lg:w-auto'
							value='table'>
							Table
						</TabsTrigger>
						<TabsTrigger
							className='h-8 w-full lg:w-auto'
							value='kanban'>
							Kanban
						</TabsTrigger>
						<TabsTrigger
							className='h-8 w-full lg:w-auto'
							value='calender'>
							Calender
						</TabsTrigger>
					</TabsList>
					<Button
						size='sm'
						onClick={open}
						className='w-full lg:w-auto'>
						<PlusIcon className='size-4 mr-2' />
						New Task
					</Button>
				</div>
				<DottedSeparator className='my-4' />
				<DataFilters />
				<DottedSeparator className='my-4' />
				{isLoadingTasks ? (
					<div className='w-full border rounded-lg h-[200px] flex flex-col items-center justify-center'>
						<Loader className='size-5 animate-spin text-muted-foreground' />
					</div>
				) : (
					<>
						<TabsContent
							value='table'
							className='mt-0'>
							{JSON.stringify(tasks)}
						</TabsContent>
						<TabsContent
							value='kanban'
							className='mt-0'>
							Data Kanban
						</TabsContent>
						<TabsContent
							value='calender'
							className='mt-0'>
							Data Calender
						</TabsContent>
					</>
				)}
			</div>
		</Tabs>
	);
};
