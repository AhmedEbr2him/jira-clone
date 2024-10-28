import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ID, Query } from 'node-appwrite';
import { sessionMiddleware } from '@/lib/session-middleware';

import { getMember } from '@/features/members/utils';

import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from '@/config';
import { createProjectSchema, updateProjectSchema } from '../schemas';

const app = new Hono()
	.post(
		'/',
		sessionMiddleware,
		zValidator('form', createProjectSchema),

		async c => {
			const databases = c.get('databases');
			const storage = c.get('storage');
			const user = c.get('user');

			const { name, image, workspaceId } = c.req.valid('form');

			const member = await getMember({
				databases,
				workspaceId,
				userId: user.$id,
			});

			if (!member) {
				return c.json({ error: 'Unauthorized' }, 400);
			}

			let uploadImageUrl: string | undefined;

			if (image instanceof File) {
				const file = await storage.createFile(IMAGES_BUCKET_ID, ID.unique(), image);

				const arrayBuffer = await storage.getFilePreview(IMAGES_BUCKET_ID, file.$id);

				uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
			}

			const project = await databases.createDocument(
				DATABASE_ID,
				PROJECTS_ID,
				ID.unique(),

				{
					name,
					imageUrl: uploadImageUrl,
					workspaceId,
				}
			);

			return c.json({ data: project });
		}
	)
	.get(
		'/',
		sessionMiddleware,
		zValidator('query', z.object({ workspaceId: z.string() })),

		async c => {
			const user = c.get('user');
			const databases = c.get('databases');

			const { workspaceId } = c.req.valid('query');

			if (!workspaceId) {
				return c.json({ error: 'Missing workspaceId' }, 400);
			}

			const member = await getMember({
				databases,
				userId: user.$id,
				workspaceId,
			});

			if (!member) {
				return c.json({ error: 'Unauthorized' }, 400);
			}

			const projects = await databases.listDocuments(
				DATABASE_ID,
				PROJECTS_ID,

				[Query.equal('workspaceId', workspaceId), Query.orderDesc('$createdAt')]
			);

			return c.json({ data: projects });
		}
	)
	.patch(
		'/:projectId',
		sessionMiddleware,
		zValidator('form', updateProjectSchema),

		async c => {
			const databases = c.get('databases');
			const storage = c.get('storage');
			const user = c.get('user');

			const { projectId } = c.req.param();

			const { name, image } = c.req.valid('form');

			const existingProject = await databases.getDocument(DATABASE_ID, PROJECTS_ID, projectId);

			const member = await getMember({
				databases,
				workspaceId: existingProject.workspaceId,
				userId: user.$id,
			});

			if (!member) {
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

			const updateProject = await databases.updateDocument(
				DATABASE_ID,
				PROJECTS_ID,
				projectId,

				{
					name,
					imageUrl: uploadImageUrl,
				}
			);

			return c.json({ data: updateProject });
		}
	)
	.delete(
		'/:projectId',
		sessionMiddleware,

		async c => {
			const databases = c.get('databases');
			const user = c.get('user');

			const { projectId } = c.req.param();

			const existingProject = await databases.getDocument(DATABASE_ID, PROJECTS_ID, projectId);

			const member = await getMember({
				databases,
				workspaceId: existingProject.workspaceId,

				userId: user.$id,
			});

			if (!member) {
				return c.json({ error: 'Unauthorized' }, 401);
			}

			await databases.deleteDocument(
				DATABASE_ID,
				PROJECTS_ID,

				projectId
			);

			return c.json({ data: { $id: existingProject.$id } });
		}
	);

export default app;