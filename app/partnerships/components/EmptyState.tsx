interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-[#9CA3AF] text-sm mb-4 text-center">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#FFD100] text-black font-medium rounded-lg text-sm hover:bg-[#FFD100]/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
