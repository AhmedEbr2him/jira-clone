import { getCurrent } from '@/features/auth/actions';
import { redirect } from 'next/navigation';

const WorkspacePageId = async () => {
	const user = await getCurrent();
	if (!user) redirect('/sign-in');

	return <div>Workspace Page Id</div>;
};

export default WorkspacePageId;