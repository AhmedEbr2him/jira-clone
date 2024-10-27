import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.members)[':memberId']['$patch'], 200>;
type RequestType = InferRequestType<(typeof client.api.members)[':memberId']['$patch']>;

export const useUpdateMember = () => {
	const queryClient = useQueryClient();

	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async ({ param, json }) => {
			const response = await client.api.members[':memberId']['$patch']({ param, json });

			if (!response.ok) {
				throw new Error('Faild to update member');
			}

			console.log({ json, param });

			return await response.json();
		},
		onSuccess: () => {
			toast.success('member updated successfully');
			queryClient.invalidateQueries({ queryKey: ['members'] });
		},
		onError: () => {
			toast.error('Faild to update member');
		},
	});

	return mutation;
};
