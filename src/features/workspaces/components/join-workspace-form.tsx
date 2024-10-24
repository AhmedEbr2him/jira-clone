'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DottedSeparator } from '@/components/dotted-separator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useInviteCode } from '../hooks/use-invite-code';
import { useJoinWorkspace } from '../api/use-join-workspace';
import { useWorkspaceId } from '../hooks/use-workspace-id';

interface JoinWorkspaceForm {
	initialValues: {
		name: string;
	};
}
export const JoinWorkspaceForm = ({ initialValues }: JoinWorkspaceForm) => {
	const router = useRouter();
	const workspaceId = useWorkspaceId();
	const inviteCode = useInviteCode();
	const { mutate, isPending } = useJoinWorkspace();

	const onSubmit = () => {
		mutate(
			{
				param: { workspaceId },
				json: { code: inviteCode },
			},
			{
				onSuccess: ({ data }) => {
					router.push(`/workspaces/${data.$id}`);
				},
			}
		);
	};
	return (
		<Card className='w-full h-full border-none shadow-none'>
			<CardHeader className='p-7'>
				<CardTitle className='text-xl font-bold'>Join Workspace</CardTitle>
				<CardDescription>
					You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace.
				</CardDescription>
			</CardHeader>

			<div className='px-7'>
				<DottedSeparator />
			</div>

			<CardContent className='p-7'>
				<div className='flex flex-col lg:flex-row items-center justify-between gap-2'>
					<Button
						variant='secondary'
						size='lg'
						asChild
						disabled={isPending}
						className='w-full lg:w-fit'>
						<Link href='/'>Cancel</Link>
					</Button>
					<Button
						size='lg'
						type='button'
						className='w-full lg:w-fit'
						disabled={isPending}
						onClick={onSubmit}>
						Join workspace
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
