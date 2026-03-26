export type InvitationStatus = "pending" | "accepted" | "declined";

export type BoardInvitationRow = {
    id: string;
    board_id: string;
    inviter_id: string;
    invitee_id: string;
    status: InvitationStatus;
    created_at: string;
    responded_at: string | null;
};

export type CreateBoardInvitationBody = {
    boardId: string;
    inviteeEmail: string;
};

export type BoardInvitation = {
    id: string;
    boardId: string;
    inviterId: string;
    inviteeId: string;
    status: InvitationStatus;
    createdAt: string;
    respondedAt: string | null;
};

export type IncomingBoardInvitationRow = {
    id: string;
    board_id: string;
    inviter_id: string;
    invitee_id: string;
    status: InvitationStatus;
    created_at: string;
    responded_at: string | null;
    board_title: string;
    inviter_username: string;
    inviter_email: string;
};

export type IncomingBoardInvitation = {
    id: string;
    boardId: string;
    boardTitle: string;
    inviterId: string;
    inviterUsername: string;
    inviterEmail: string;
    inviteeId: string;
    status: InvitationStatus;
    createdAt: string;
    respondedAt: string | null;
};