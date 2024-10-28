import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.projects)[':projectId']['$patch'], 200>;
type RequestType = InferRequestType<(typeof client.api.projects)[':projectId']['$patch']>;

export const useUpdateProject = () => {
	const router = useRouter();
	const queryClient = useQueryClient();

	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ param, form }) => {
			const response = await client.api.projects[':projectId']['$patch']({ param, form });

			if (!response.ok) {
				throw new Error('Faild to update project');
			}

			return await response.json();
		},
		onSuccess: ({ data }) => {
			toast.success('New project updated successfully');
			router.refresh();
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: ['projects', data.$id] });
		},
		onError: () => {
			toast.error('Faild to update project');
		},
	});

	return mutation;
};
