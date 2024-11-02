import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Query } from 'node-appwrite';

import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from '@/config';

import { sessionMiddleware } from '@/lib/session-middleware';
import { createAdminClient } from '@/lib/appwrite';
import { getMember } from '../utils';
import { MemberRole } from '../types';

const app = new Hono()
	.get(
		'/',
		sessionMiddleware,
		zValidator('query', z.object({ workspaceId: z.string() })),

		async c => {
			const { users } = await createAdminClient();
			const databases = c.get('databases');
			const user = c.get('user');
			const { workspaceId } = c.req.valid('query');

			const member = await getMember({
				databases,
				workspaceId,
				userId: user.$id,
			});

			if (!member) {
				return c.json({ error: 'Unauthorized' }, 401);
			}

			const members = await databases.listDocuments(
				DATABASE_ID,
				MEMBERS_ID,

				[Query.equal('workspaceId', workspaceId)] // get all user with id only not name or any data
			);

			const populatedMembers = await Promise.all(
				members.documents.map(async member => {
					const user = await users.get(member.userId);

					return {
						...user,
						name: user.name,
						email: user.email,
					};
				})
			);

			return c.json({
				data: {
					...members,
					documents: populatedMembers,
				},
			});
		}
	)
	.delete(
		'/:memberId',
		sessionMiddleware,

		async c => {
			const { memberId } = c.req.param();
			const user = c.get('user');
			const databases = c.get('databases');

			const memberToDelete = await databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId);

			// loading all other members which are in the same workspace as the member we attempting to delete because we don't have the workspaceId inside of the url here
			const allMembersInWorkspace = await databases.listDocuments(
				DATABASE_ID,
				MEMBERS_ID,

				[Query.equal('workspaceId', memberToDelete.workspaceId)]
			);

			// ourselves
			const member = await getMember({
				databases,
				workspaceId: memberToDelete.workspaceId,
				userId: user.$id,
			});

			if (!member) {
				return c.json({ error: 'Unauthorized' }, 401);
			}

			// if we not trying to remove ourselves we are attembing to remove somone else
			if (member.$id && member.role !== MemberRole.ADMIN) {
				return c.json({ error: 'Unauthorized' }, 401);
			}
			if (allMembersInWorkspace.total === 1) {
				return c.json({ error: 'Cannot delete the only member' }, 400);
			}

			// TODO: DELETE TASKS
			await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberToDelete.$id);

			return c.json({ data: { $id: memberToDelete.$id } });
		}
	)
	.patch(
		'/:memberId',
		sessionMiddleware,
		zValidator('json', z.object({ role: z.nativeEnum(MemberRole) })),

		async c => {
			const { memberId } = c.req.param();
			const { role } = c.req.valid('json');
			const user = c.get('user');
			const databases = c.get('databases');

			const memberToUpdate = await databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId);

			// loading all other members which are in the same workspace as the member we attempting to delete because we don't have the workspaceId inside of the url here
			const allMembersInWorkspace = await databases.listDocuments(
				DATABASE_ID,
				MEMBERS_ID,

				[Query.equal('workspaceId', memberToUpdate.workspaceId)]
			);

			const member = await getMember({
				databases,
				workspaceId: memberToUpdate.workspaceId,
				userId: user.$id,
			});

			if (!member) {
				return c.json({ error: 'Unauthorized' }, 401);
			}

			// if we not trying to remove ourselves we are attembing to remove somone else
			if (member.role !== MemberRole.ADMIN) {
				return c.json({ error: 'Unauthorized' }, 401);
			}
			if (allMembersInWorkspace.total === 1) {
				return c.json({ error: 'Cannot downgrade the only member' }, 400);
			}

			await databases.updateDocument(
				DATABASE_ID,
				MEMBERS_ID,
				memberId,

				{
					role,
				}
			);

			return c.json({ data: { $id: memberToUpdate.$id } });
		}
	);

export default app;
