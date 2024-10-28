import { getCurrent } from '@/features/auth/queries';
import { UpdateProjectForm } from '@/features/projects/components/update-project-form';
import { getProject } from '@/features/projects/queries';
import { redirect } from 'next/navigation';

interface ProjectIdSettingsPageProps {
	params: {
		projectId: string;
	};
}
const ProjectIdSettingsPage = async ({ params }: ProjectIdSettingsPageProps) => {
	const user = getCurrent();
	if (!user) redirect('/sign-in');

	const initialValues = await getProject({ projectId: params.projectId });

	return (
		<div className='w-full lg:max-w-xl'>
			<UpdateProjectForm initialValues={initialValues} />
		</div>
	);
};

export default ProjectIdSettingsPage;
