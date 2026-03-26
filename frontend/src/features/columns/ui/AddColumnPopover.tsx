import { Button } from '@/components/ui/button'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Plus } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'

type ColumnFormValues = {
    title: string
    wipLimit?: string
}

type AddColumnPopoverProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: UseFormReturn<ColumnFormValues>
    onSubmit: (data: ColumnFormValues) => void | Promise<void>
    onReset: () => void
}

export const AddColumnPopover = ({
    open,
    onOpenChange,
    form,
    onSubmit,
    onReset,
}: AddColumnPopoverProps) => {
    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen)

                if (!nextOpen) {
                    onReset()
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button>
                    <Plus />
                    Добавить колонку
                </Button>
            </PopoverTrigger>

            <PopoverContent className="flex flex-col gap-4">
                <PopoverHeader>
                    <PopoverTitle>Новая колонка</PopoverTitle>
                    <PopoverDescription>
                        Укажите название колонки и при необходимости лимит
                        задач.
                    </PopoverDescription>
                </PopoverHeader>

                <form
                    id="create-column-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FieldGroup className="gap-4">
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="column-title">
                                        Название
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="column-title"
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
                            name="wipLimit"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="column-wip-limit">
                                        Лимит задач
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        id="column-wip-limit"
                                        type="number"
                                        min={1}
                                        placeholder="Введите лимит"
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
                    <Button type="submit" form="create-column-form">
                        <Plus />
                        Добавить
                    </Button>
                </Field>
            </PopoverContent>
        </Popover>
    )
}
