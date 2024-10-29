'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useCreateTaskModal } from '../hooks/use-create-task-modal';
import { CreateTasksFormWrapper } from './create-task-form-wrapper';

export const CreateTaskModal = () => {
	const { isOpen, setIsOpen, close } = useCreateTaskModal();

	return (
		<ResponsiveModal
			open={isOpen}
			onOpenChange={setIsOpen}>
			<div className=''>
				<CreateTasksFormWrapper onCancel={close} />
			</div>
		</ResponsiveModal>
	);
};
