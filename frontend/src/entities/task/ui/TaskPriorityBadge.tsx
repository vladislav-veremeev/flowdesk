import { type TaskPriority, taskPriorityLabels } from '@/entities/task'
import { Badge } from '@/components/ui/badge.tsx'

type TaskPriorityBadgeProps = {
    priority: TaskPriority
}

export const TaskPriorityBadge = ({ priority }: TaskPriorityBadgeProps) => {
    const styles: Record<TaskPriority, string> = {
        low: 'bg-green-50 text-green-700',
        medium: 'bg-blue-50 text-blue-700',
        high: 'bg-red-50 text-red-700',
    }

    return (
        <Badge className={styles[priority]}>
            {taskPriorityLabels[priority]}
        </Badge>
    )
}
