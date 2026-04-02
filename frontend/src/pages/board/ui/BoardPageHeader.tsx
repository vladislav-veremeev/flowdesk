import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, MailPlus, Send, UserRound } from 'lucide-react'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item.tsx'
import { Field, FieldError, FieldLabel } from '@/components/ui/field.tsx'
import type { InviteFormValues } from '@/entities/board-invitation'
import type { Board } from '@/entities/board'
import type { BoardMember } from '@/entities/board-member'

type BoardPageHeaderProps = {
    board: Board
    members: BoardMember[]
    isOwner: boolean
    inviteDialogOpen: boolean
    setInviteDialogOpen: (open: boolean) => void
    inviteForm: UseFormReturn<InviteFormValues>
    onInviteMember: (data: InviteFormValues) => void | Promise<void>
    onResetInviteForm: () => void
}

export const BoardPageHeader = ({
    board,
    members,
    isOwner,
    inviteDialogOpen,
    setInviteDialogOpen,
    inviteForm,
    onInviteMember,
    onResetInviteForm,
}: BoardPageHeaderProps) => {
    return (
        <Item className="p-0">
            <ItemContent>
                <ItemTitle className="text-xl">
                    {board.title}

                    {members.map((member) => (
                        <Badge
                            key={member.userId}
                            variant="outline"
                            className="bg-background"
                        >
                            <UserRound />
                            {member.role === 'owner'
                                ? `${member.username} - владелец`
                                : member.username}
                        </Badge>
                    ))}
                </ItemTitle>

                {board.description && (
                    <ItemDescription>{board.description}</ItemDescription>
                )}
            </ItemContent>

            <ItemActions>
                {isOwner && (
                    <Dialog
                        open={inviteDialogOpen}
                        onOpenChange={(open) => {
                            setInviteDialogOpen(open)

                            if (!open) {
                                onResetInviteForm()
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <MailPlus />
                                Пригласить
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Пригласить участника</DialogTitle>
                                <DialogDescription>
                                    Введите имя пользователя, которого хотите
                                    пригласить на доску.
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                id="invite-form"
                                onSubmit={inviteForm.handleSubmit(
                                    onInviteMember
                                )}
                            >
                                <Controller
                                    name="username"
                                    control={inviteForm.control}
                                    render={({ field, fieldState }) => (
                                        <Field
                                            data-invalid={fieldState.invalid}
                                        >
                                            <FieldLabel htmlFor="username">
                                                Имя пользоваетеля
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="username"
                                                placeholder="Введите имя пользователя"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                            />
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                            </form>

                            <DialogFooter>
                                <DialogClose>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onResetInviteForm}
                                    >
                                        Отмена
                                    </Button>
                                </DialogClose>

                                <Button type="submit" form="invite-form">
                                    <Send />
                                    Отправить
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                <Button asChild variant="outline">
                    <Link to={`/boards/${board.id}/stats`}>
                        <BarChart3 />
                        Статистика
                    </Link>
                </Button>

                <Button asChild variant="outline">
                    <Link to="/">
                        <ArrowLeft />
                        Назад
                    </Link>
                </Button>
            </ItemActions>
        </Item>
    )
}
