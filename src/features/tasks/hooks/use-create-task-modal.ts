import { useQueryState, parseAsBoolean } from 'nuqs';

export const useCreateTaskModal = () => {
	const [isOpen, setIsOpen] = useQueryState(
		'create-task',
		parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
	);
	// localhost:3000?create-workspace=true -> clearOnDefalt => localhost:3000 | create-workspace appears only when setIsOpen with true

	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);
	return {
		isOpen,
		open,
		close,
		setIsOpen,
	};
};
