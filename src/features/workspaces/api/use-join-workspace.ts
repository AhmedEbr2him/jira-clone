import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
	(typeof client.api.workspaces)[':workspaceId']['join']['$post'],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.workspaces)[':workspaceId']['join']['$post']
>;

export const useJoinWorkspace = () => {
	const queryClient = useQueryClient();

	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ json, param }) => {
			const response = await client.api.workspaces[':workspaceId']['join']['$post']({
				json,
				param,
			});

			if (!response.ok) {
				throw new Error('Faild to join workspace');
			}

			return await response.json();
		},
		onSuccess: ({ data }) => {
			toast.success('Joined workspace successfully');
			queryClient.invalidateQueries({ queryKey: ['workspaces'] });
			queryClient.invalidateQueries({ queryKey: ['workspaces', data.$id] });
		},
		onError: () => {
			toast.error('Faild to join workspace');
		},
	});

	return mutation;
};
