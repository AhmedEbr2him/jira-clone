'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { ArrowLeft, MoreVerticalIcon } from 'lucide-react';

import { useConfirm } from '@/hooks/use-confirm';

import { MemberRole } from '@/features/members/types';
import { MemberAvatar } from '@/features/members/components/member-avatar';

import { useWorkspaceId } from '../hooks/use-workspace-id';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useDeleteMember } from '@/features/members/api/use-delete-member';
import { useUpdateMember } from '@/features/members/api/use-update-member';

import { Button } from '@/components/ui/button';
import { DottedSeparator } from '@/components/dotted-separator';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MembersList = () => {
	const workspaceId = useWorkspaceId();
	const [ConfirmDialog, confirmRemove] = useConfirm(
		'Remove Member',
		'This Member will be removed from the workspace.',
		'destructive'
	);

	const { data } = useGetMembers({ workspaceId });
	const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();
	const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();

	const handleUpdateMember = (memberId: string, role: MemberRole) => {
		updateMember({
			json: { role },
			param: { memberId: memberId },
		});
	};

	const handleDeleteMember = async (memberId: string) => {
		const ok = await confirmRemove();
		if (!ok) return;

		deleteMember(
			{ param: { memberId: memberId } },
			{
				onSuccess: () => {
					window.location.reload();
				},
			}
		);
	};
	return (
		<Card className='w-full h-full border-none shadow-none'>
			<ConfirmDialog />
			<CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'>
				<Button
					variant='secondary'
					size='sm'
					asChild>
					<Link href={`/workspaces/${workspaceId}`}>
						<ArrowLeft className='size-4 mr-2' />
						Back
					</Link>
				</Button>
				<CardTitle className='text-xl font-bold'>Members List</CardTitle>
			</CardHeader>

			<div className='px-7'>
				<DottedSeparator />
			</div>
			<CardContent className='p-7'>
				{data?.documents.map((member, index) => (
					<Fragment key={member.$id}>
						<div className='flex items-center gap-2'>
							<MemberAvatar
								className='size-10'
								fallbackClassName='text-lg'
								name={member.name}
							/>
							<div className='flex flex-col '>
								<p className='text-sm font-medium'>{member.name}</p>
								<p className='text-xs text-muted-foreground'>{member.email}</p>
							</div>
							<DropdownMenu>
								{/* asChild to avoid hydration error -> button inside button */}
								<DropdownMenuTrigger asChild>
									<Button
										variant='secondary'
										size='icon'
										className='ml-auto'>
										<MoreVerticalIcon className='size-4 text-muted-foreground' />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									side='bottom'
									align='end'>
									<DropdownMenuItem
										className='font-medium'
										onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
										disabled={isUpdatingMember}>
										Set as Adminstrator
									</DropdownMenuItem>

									<DropdownMenuItem
										className='font-medium'
										onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
										disabled={isUpdatingMember}>
										Set as Member
									</DropdownMenuItem>

									<DropdownMenuItem
										className='font-medium text-amber-700'
										onClick={() => handleDeleteMember(member.$id)}
										disabled={isDeletingMember}>
										Remove {member.name}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						{/* add separator to all members expect last memeber */}
						{index < data?.documents.length - 1 && <Separator className='my-2.5 ' />}
					</Fragment>
				))}
			</CardContent>
		</Card>
	);
};
