import { Controller, type UseFormReturn } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export type TaskFormValues = {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
}

type AddTaskPopoverProps = {
    columnId: string
    open: boolean
    disabled?: boolean
    form: UseFormReturn<TaskFormValues>
    onOpenChange: (open: boolean) => void
    onSubmit: (columnId: string, data: TaskFormValues) => void
}

export const AddTaskPopover = ({
    columnId,
    open,
    disabled = false,
    form,
    onOpenChange,
    onSubmit,
}: AddTaskPopoverProps) => {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button className="w-full" disabled={disabled}>
                    <Plus />
                    Добавить задачу
                </Button>
            </PopoverTrigger>

            <PopoverContent className="flex flex-col gap-4">
                <PopoverHeader>
                    <PopoverTitle>Новая задача</PopoverTitle>
                    <PopoverDescription>
                        Заполните данные новой задачи.
                    </PopoverDescription>
                </PopoverHeader>

                <form
                    id={`create-task-form-${columnId}`}
                    onSubmit={form.handleSubmit((data) =>
                        onSubmit(columnId, data)
                    )}
                >
                    <FieldGroup className="gap-4">
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={`task-title-${columnId}`}
                                    >
                                        Название
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={`task-title-${columnId}`}
                                        placeholder="Введите название"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={`task-description-${columnId}`}
                                    >
                                        Описание
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        value={field.value ?? ''}
                                        id={`task-description-${columnId}`}
                                        placeholder="Введите описание"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="priority"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={`task-priority-${columnId}`}
                                    >
                                        Приоритет
                                    </FieldLabel>
                                    <Select
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id={`task-priority-${columnId}`}
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue placeholder="Выберите приоритет" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                Низкий
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                Средний
                                            </SelectItem>
                                            <SelectItem value="high">
                                                Высокий
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="dueDate"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                        htmlFor={`task-due-date-${columnId}`}
                                    >
                                        Срок
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        id={`task-due-date-${columnId}`}
                                        type="datetime-local"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>

                <Field>
                    <Button
                        type="submit"
                        form={`create-task-form-${columnId}`}
                        disabled={disabled}
                    >
                        <Plus />
                        Добавить
                    </Button>
                </Field>
            </PopoverContent>
        </Popover>
    )
}
