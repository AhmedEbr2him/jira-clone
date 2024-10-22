import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { createWorkspacesSchema, updateWorkspacesSchema } from '../schemas';

import { MemberRole } from '@/features/members/types';

import { generateInviteCode } from '@/lib/utils';

import { sessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from '@/config';
import { ID, Query } from 'node-appwrite';
import { getMember } from '@/features/members/utils';

// / -> /workspaces because we already created endpoint in [[...route]]
const app = new Hono()
	.get(
		'/',
		sessionMiddleware,

		async c => {
			const user = c.get('user');
			const database = c.get('databases');

			// get member collection and connect user with same user created workspace
			const members = await database.listDocuments(
				DATABASE_ID,
				MEMBERS_ID,

				[Query.equal('userId', user.$id)]
			);

			// empty documents if new member register
			if (members.total === 0) {
				return c.json({ data: { documents: [], total: 0 } });
			}

			// get member workspace id
			const workspaceIds = members.documents.map(member => member.workspaceId);

			const workspace = await database.listDocuments(
				DATABASE_ID,
				WORKSPACES_ID,

				[Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)]
			);

			return c.json({ data: workspace });
		}
	)
	.post(
		'/',
		zValidator('form', createWorkspacesSchema), // form instead of json because we can't send image throw json

		sessionMiddleware,

		async c => {
			const databases = c.get('databases');
			const storage = c.get('storage');
			const user = c.get('user');

			const { name, image } = c.req.valid('form');

			let uploadImageUrl: string | undefined;

			if (image instanceof File) {
				const file = await storage.createFile(IMAGES_BUCKET_ID, ID.unique(), image);

				const arrayBuffer = await storage.getFilePreview(IMAGES_BUCKET_ID, file.$id);

				uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
			}

			const workspace = await databases.createDocument(
				DATABASE_ID,
				WORKSPACES_ID,
				ID.unique(),

				{
					name,
					userId: user.$id,
					imageUrl: uploadImageUrl,
					inviteCode: generateInviteCode(10),
				}
			);

			// when we create a new workspace we automatically create a new member
			await databases.createDocument(
				DATABASE_ID,
				MEMBERS_ID,
				ID.unique(),

				{
					userId: user.$id,
					workspaceId: workspace.$id,
					role: MemberRole.ADMIN,
				}
			);

			return c.json({ data: workspace });
		}
	)
	.patch(
		'/:workspaceId',
		sessionMiddleware,
		zValidator('form', updateWorkspacesSchema),

		async c => {
			const databases = c.get('databases');
			const storage = c.get('storage');
			const user = c.get('user');

			const { workspaceId } = c.req.param();

			const { name, image } = c.req.valid('form');

			const member = await getMember({
				databases,
				workspaceId,
				userId: user.$id,
			});

			if (!member || member.role !== MemberRole.ADMIN) {
				return c.json({ error: 'Unauthorized' }, 401);
			}

			let uploadImageUrl: string | undefined;

			if (image instanceof File) {
				const file = await storage.createFile(IMAGES_BUCKET_ID, ID.unique(), image);

				const arrayBuffer = await storage.getFilePreview(IMAGES_BUCKET_ID, file.$id);

				uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
			} else {
				uploadImageUrl = image;
			}

			const updatedWorkspace = await databases.updateDocument(
				DATABASE_ID,
				WORKSPACES_ID,
				workspaceId,

				{
					name,
					imageUrl: uploadImageUrl,
				}
			);

			return c.json({ data: updatedWorkspace });
		}
	);

export default app;
