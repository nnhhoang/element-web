/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import { type FacePileViewModel } from "../../../../../core/FacePile/FacePileView";
import { type MemberAvatarViewModel } from "../../../../../core/MemberAvatar/MemberAvatarView";
import { type ViewModel } from "../../../../../core/viewmodel";
import { type CallDirection } from "../common";

/**
 * This snapshot type contains state used by both RoomOngoingCallTileView and
 * DmOngoingCallTileView.
 */
export interface CommonOngoingCallTileViewSnapshot {
    startedByDisplayName: string;

    /**
     * Avatar vm for the user who started this call.
     */
    memberAvatarViewModel: MemberAvatarViewModel;

    /**
     * Face pile view-model for the participants on this call.
     */
    facePileViewModel: FacePileViewModel;

    /**
     * Timestamp of when this call started.
     */
    callStartTs: number;

    /**
     * Whether this is an incoming or outgoing call.
     */
    callDirection: CallDirection;

    /**
     * Whether our user has joined this call.
     */
    isJoined: boolean;

    /**
     * Whether our user can join this call or not.
     */
    isJoinable: boolean;
}

export interface CommonOngoingCallTileViewAction {
    /**
     * Join this call
     */
    join: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export type CallStartedTileFooViewModel = ViewModel<CommonOngoingCallTileViewSnapshot>;
