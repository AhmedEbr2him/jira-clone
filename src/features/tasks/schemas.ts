import { z } from 'zod';

import { TaskStatus } from './types';

export const createTasksSchema = z.object({
	name: z.string().trim().min(1, '*This field is required'),
	status: z.nativeEnum(TaskStatus, { required_error: '*This field is required' }),
	workspaceId: z.string().trim().min(1, 'Required'),
	projectId: z.string().trim().min(1, 'Required'),
	dueDate: z.coerce.date(),
	assigneeId: z.string().trim().min(1, 'Required'),
	description: z.string().optional(),
});
