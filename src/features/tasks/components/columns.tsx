'use client';

import { ArrowUpDown } from 'lucide-react';

import { ColumnDef } from '@tanstack/react-table';

import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { MemberAvatar } from '@/features/members/components/member-avatar';

import { Button } from '@/components/ui/button';

import { Task } from '../types';

export const columns: ColumnDef<Task>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Task Name
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},

		cell: ({ row }) => {
			const name = row.original.name;

			return <p className='line-clamp-1'>{name}</p>;
		},
	},

	{
		accessorKey: 'project',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Project
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},

		cell: ({ row }) => {
			const project = row.original.project;

			return (
				<div className='flex items-center gap-x-2 text-sm font-medium'>
					<ProjectAvatar
						name={project.name}
						image={project.imageUrl}
						className='size-6'
					/>
					<p className='line-clamp-1'>{project.name}</p>
				</div>
			);
		},
	},

	{
		accessorKey: 'assignee',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					Assiignee
					<ArrowUpDown className='ml-2 h-4 w-4' />
				</Button>
			);
		},

		cell: ({ row }) => {
			// const member = row.original.assignee;

			return (
				<div className='flex items-center gap-x-2 text-sm font-medium'>
					{/* <MemberAvatar name={member.name} /> */}
					<p className='line-clamp-1'> </p>
				</div>
			);
		},
	},
];
