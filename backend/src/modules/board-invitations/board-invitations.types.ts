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
    inviteeUsername: string;
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
};

export type IncomingBoardInvitation = {
    id: string;
    boardId: string;
    boardTitle: string;
    inviterId: string;
    inviterUsername: string;
    inviteeId: string;
    status: InvitationStatus;
    createdAt: string;
    respondedAt: string | null;
};
