/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import {
    type CommonOngoingCallTileViewAction,
    type RoomOngoingCallTileViewSnapshot,
} from "@element-hq/web-shared-components";
import { MatrixEventEvent, type MatrixEvent, type RoomMember } from "matrix-js-sdk/src/matrix";

import { CallStore } from "../../../../../../../stores/CallStore";
import { type Props, BaseOngoingCallViewModel } from "./BaseOngoingCallTileViewModel";
import { getDeclinedEvents, getIntentFromEvent } from "../../common";
import { type GetRelationsForEvent } from "../../../../../../../components/views/rooms/EventTile";
import { MatrixClientPeg } from "../../../../../../../MatrixClientPeg";

/**
 * Check if this call is declined by our user.
 */
function isCallDeclinedByOwnUser(notificationEvent: MatrixEvent, getRelationsForEvent?: GetRelationsForEvent): boolean {
    const declinedEvents = getDeclinedEvents(notificationEvent, getRelationsForEvent);
    const ownUserId = MatrixClientPeg.safeGet().getUserId();
    return declinedEvents?.some((event) => event.getSender() === ownUserId) ?? false;
}

export class RoomOngoingCallTileViewModel
    extends BaseOngoingCallViewModel<RoomOngoingCallTileViewSnapshot>
    implements CommonOngoingCallTileViewAction
{
    public constructor(props: Props) {
        // Get the call in the room
        const call = CallStore.instance.getCall(props.roomId);
        if (!call) {
            throw new Error(`Not call in room ${props.roomId}`);
        }
        const totalParticipants = call.participants.size;
        const isCallIgnored = isCallDeclinedByOwnUser(props.mxEvent, props.getRelationsForEvent);
        super(props, { totalParticipants, isCallIgnored });

        // When a relation is added to the event, recompute the state.
        this.disposables.trackListener(props.mxEvent, MatrixEventEvent.RelationsCreated, () => {
            this.onRelationsCreated();
        });
    }

    private onRelationsCreated(): void {
        const isCallIgnored = isCallDeclinedByOwnUser(this.props.mxEvent, this.props.getRelationsForEvent);
        this.snapshot.merge({ isCallIgnored });
    }

    protected onParticipantsChange(participants: Map<RoomMember, Set<string>>): void {
        const totalParticipants = participants.size;
        super.onParticipantsChange(participants, { totalParticipants });
    }

    public join(event: React.MouseEvent<HTMLButtonElement>): void {
        const mxEvent = this.props.mxEvent;
        const callType = getIntentFromEvent(mxEvent);
        super.join(event, callType);
    }
}
