import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Mail, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import type { IncomingInvitation } from '@/entities/invitation'
import {
    acceptBoardInvitation,
    declineBoardInvitation,
    deleteBoardInvitation,
    getMyInvitations,
} from '@/features/board-invitations'
import { formatDateTime } from '@/shared/lib'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Field } from '@/components/ui/field.tsx'

const getStatusLabel = (status: IncomingInvitation['status']) => {
    switch (status) {
        case 'pending':
            return 'Ожидает ответа'
        case 'accepted':
            return 'Принято'
        case 'declined':
            return 'Отклонено'
        default:
            return status
    }
}

const getStatusVariant = (status: IncomingInvitation['status']) => {
    switch (status) {
        case 'pending':
            return 'outline'
        case 'accepted':
            return 'default'
        case 'declined':
            return 'secondary'
        default:
            return 'outline'
    }
}

export const InvitationsPage = () => {
    const [invitations, setInvitations] = useState<IncomingInvitation[]>([])
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        const loadInvitations = async () => {
            try {
                const data = await getMyInvitations()
                setInvitations(data)
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message ||
                        'Не удалось загрузить приглашения'
                )
            }
        }

        loadInvitations()
    }, [])

    const handleDelete = async (invitationId: string) => {
        try {
            setProcessingId(invitationId)
            await deleteBoardInvitation(invitationId)

            setInvitations((current) =>
                current.filter((invitation) => invitation.id !== invitationId)
            )

            toast.success('Приглашение удалено')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'Не удалось удалить приглашение'
            )
        } finally {
            setProcessingId(null)
        }
    }

    const handleAccept = async (invitationId: string) => {
        try {
            setProcessingId(invitationId)
            await acceptBoardInvitation(invitationId)

            setInvitations((current) =>
                current.map((invitation) =>
                    invitation.id === invitationId
                        ? {
                              ...invitation,
                              status: 'accepted',
                              respondedAt: new Date().toISOString(),
                          }
                        : invitation
                )
            )

            toast.success('Приглашение принято')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'Не удалось принять приглашение'
            )
        } finally {
            setProcessingId(null)
        }
    }

    const handleDecline = async (invitationId: string) => {
        try {
            setProcessingId(invitationId)
            await declineBoardInvitation(invitationId)

            setInvitations((current) =>
                current.map((invitation) =>
                    invitation.id === invitationId
                        ? {
                              ...invitation,
                              status: 'declined',
                              respondedAt: new Date().toISOString(),
                          }
                        : invitation
                )
            )

            toast.success('Приглашение отклонено')
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'Не удалось отклонить приглашение'
            )
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="flex justify-center py-4">
            <Card className="w-xl">
                <CardHeader>
                    <CardTitle className="text-xl">Приглашения</CardTitle>
                    <CardDescription>
                        Приглашения, полученные пользователем.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {invitations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            У вас пока нет приглашений на доски.
                        </p>
                    ) : (
                        invitations.map((invitation) => {
                            const isPending = invitation.status === 'pending'
                            const isAccepted = invitation.status === 'accepted'
                            const isProcessing = processingId === invitation.id

                            return (
                                <Card key={invitation.id}>
                                    <CardHeader className="flex">
                                        <CardTitle>
                                            {invitation.boardTitle}
                                        </CardTitle>

                                        <CardDescription>
                                            <Badge
                                                variant={getStatusVariant(
                                                    invitation.status
                                                )}
                                            >
                                                {getStatusLabel(
                                                    invitation.status
                                                )}
                                            </Badge>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="text-sm flex flex-col gap-2">
                                        <p>
                                            <span className="font-medium">
                                                Пригласил:
                                            </span>{' '}
                                            {invitation.inviterUsername} (
                                            {invitation.inviterEmail})
                                        </p>

                                        <p>
                                            <span className="font-medium">
                                                Отправлено:
                                            </span>{' '}
                                            {formatDateTime(
                                                invitation.createdAt
                                            )}
                                        </p>

                                        {invitation.respondedAt && (
                                            <p>
                                                <span className="font-medium">
                                                    Ответ дан:
                                                </span>{' '}
                                                {formatDateTime(
                                                    invitation.respondedAt
                                                )}
                                            </p>
                                        )}
                                    </CardContent>

                                    <CardFooter>
                                        <Field orientation="horizontal">
                                            {isPending && (
                                                <>
                                                    <Button
                                                        onClick={() =>
                                                            handleAccept(
                                                                invitation.id
                                                            )
                                                        }
                                                        disabled={isProcessing}
                                                    >
                                                        <Check />
                                                        Принять
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleDecline(
                                                                invitation.id
                                                            )
                                                        }
                                                        disabled={isProcessing}
                                                    >
                                                        <X />
                                                        Отклонить
                                                    </Button>
                                                </>
                                            )}

                                            {isAccepted && (
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                >
                                                    <Link
                                                        to={`/boards/${invitation.boardId}`}
                                                    >
                                                        Открыть доску
                                                    </Link>
                                                </Button>
                                            )}

                                            {invitation.status !==
                                                'pending' && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleDelete(
                                                            invitation.id
                                                        )
                                                    }
                                                    disabled={isProcessing}
                                                >
                                                    <Trash2 />
                                                    Удалить
                                                </Button>
                                            )}
                                        </Field>
                                    </CardFooter>
                                </Card>
                            )
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
