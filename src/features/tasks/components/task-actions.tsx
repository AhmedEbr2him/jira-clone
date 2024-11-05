import { ExternalLinkIcon, PencilIcon, TrashIcon } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { useConfirm } from '@/hooks/use-confirm';

import { useDeleteTask } from '../api/use-delete-task';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskActionsProps {
	id: string;
	projectId: string;
	children: React.ReactNode;
}

export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {
	const workspaceId = useWorkspaceId();
	const router = useRouter();

	const [ConfirmeDialog, confirm] = useConfirm(
		'Delete Task',
		'This action cannot be undone.',
		'destructive'
	);

	const { mutate: deleteTask, isPending: isPendingDeleteting } = useDeleteTask();

	const onDelete = async () => {
		const ok = await confirm();
		if (!ok) return;

		deleteTask({ param: { taskId: id } });
	};

	const onOpenTask = () => {
		router.push(`/workspaces/${workspaceId}/tasks/${id}`);
	};
	const onOpenProject = () => {
		router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
	};
	return (
		<div className='flex justify-end'>
			<ConfirmeDialog />
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
				<DropdownMenuContent
					align='end'
					className='w-48'>
					<DropdownMenuItem
						onClick={onOpenProject}
						disabled={false}
						className='font-medium p-[10px]'>
						<ExternalLinkIcon className='size-4 mr-2 stroke-2' />
						Open Project
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={onOpenTask}
						disabled={false}
						className='font-medium p-[10px]'>
						<ExternalLinkIcon className='size-4 mr-2 stroke-2' />
						Task Details
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {}}
						disabled={false}
						className='font-medium p-[10px]'>
						<PencilIcon className='size-4 mr-2 stroke-2' />
						Edit Task
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {}}
						disabled={false}
						className='font-medium p-[10px]'>
						<ExternalLinkIcon className='size-4 mr-2 stroke-2' />
						Task Details
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={onDelete}
						disabled={isPendingDeleteting}
						className='text-amber-700 font-medium p-[10px]'>
						<TrashIcon className='size-4 mr-2 stroke-2' />
						Delete Task
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
