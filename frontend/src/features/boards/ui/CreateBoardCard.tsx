import { Card } from '@/components/ui/card'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { BoardFormValues } from '@/entities/board'

type CreateBoardCardProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: UseFormReturn<BoardFormValues>
    onSubmit: (data: BoardFormValues) => void | Promise<void>
    onReset: () => void
}

export const CreateBoardCard = ({
    open,
    onOpenChange,
    form,
    onSubmit,
    onReset,
}: CreateBoardCardProps) => {
    return (
        <Card className="p-0">
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
                    <Button variant="ghost" className="h-full text-base">
                        <Plus />
                        Создать
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="flex flex-col gap-4">
                    <PopoverHeader>
                        <PopoverTitle>Новая доска</PopoverTitle>
                        <PopoverDescription>
                            Создайте доску для задач, заметок или командной
                            работы.
                        </PopoverDescription>
                    </PopoverHeader>

                    <form
                        id="create-board-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup className="gap-4">
                            <Controller
                                name="title"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="create-board-title">
                                            Название
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="create-board-title"
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
                                        <FieldLabel htmlFor="create-board-description">
                                            Описание
                                        </FieldLabel>
                                        <Textarea
                                            {...field}
                                            id="create-board-description"
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
                        </FieldGroup>
                    </form>

                    <Field>
                        <Button type="submit" form="create-board-form">
                            <Plus />
                            Создать
                        </Button>
                    </Field>
                </PopoverContent>
            </Popover>
        </Card>
    )
}
