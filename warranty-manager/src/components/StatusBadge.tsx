
import { cn } from "@/lib/utils";

type StatusType = "open" | "progress" | "waiting" | "completed";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig = {
  open: {
    class: "status-open",
    defaultLabel: "Открыто"
  },
  progress: {
    class: "status-progress",
    defaultLabel: "В ремонте"
  },
  waiting: {
    class: "status-waiting",
    defaultLabel: "Ожидает запчастей"
  },
  completed: {
    class: "status-completed",
    defaultLabel: "Завершено"
  }
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn("status-badge", config.class, className)}>
      {label || config.defaultLabel}
    </span>
  );
}
