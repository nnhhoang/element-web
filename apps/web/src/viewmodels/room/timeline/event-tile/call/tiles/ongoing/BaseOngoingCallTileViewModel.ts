/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import {
    BaseViewModel,
    CallDirection,
    CallType as SharedComponentsCallType,
    type CommonOngoingCallTileViewSnapshot,
} from "@element-hq/web-shared-components";
import { EventTimeline, EventType, type RoomMember, type MatrixEvent } from "matrix-js-sdk/src/matrix";
import { CallType } from "matrix-js-sdk/src/webrtc/call";

import { CallStore } from "../../../../../../../stores/CallStore";
import { MemberAvatarViewModel } from "../../../../../../../components/viewmodels/avatars/MemberAvatarViewModel";
import { FacePileViewModel } from "../../../../../../../components/viewmodels/avatars/FacePileViewModel";
import { MatrixClientPeg } from "../../../../../../../MatrixClientPeg";
import { CallEvent, type ElementCall } from "../../../../../../../models/Call";
import { placeCall } from "../../../../../../../utils/room/placeCall";
import { PlatformCallType } from "../../../../../../../hooks/room/useRoomCall";
import { type GetRelationsForEvent } from "../../../../../../../components/views/rooms/EventTile";

export interface Props {
    /**
     * The id of the room.
     */
    roomId: string;
    /**
     * Event of type `org.matrix.msc4075.rtc.notification`.
     */
    mxEvent: MatrixEvent;
    /**
     * Helper to fetch related events from a given event.
     */
    getRelationsForEvent?: GetRelationsForEvent;
}

function getCallInRoom(roomId: string): ElementCall {
    const call = CallStore.instance.getCall(roomId) as ElementCall | null;
    if (!call) {
        throw new Error(`No call in room ${roomId}`);
    }
    return call;
}

function computeSnapshot(props: Props): CommonOngoingCallTileViewSnapshot {
    const mxEvent = props.mxEvent;
    const roomId = mxEvent.getRoomId();
    if (!roomId) {
        throw new Error("RTCNotification event has no room associated with it!");
    }

    // Get the call in the room
    const call = getCallInRoom(roomId);

    // Find the mx-id of the user who started this call
    const startedUserId = mxEvent.getSender();
    if (!startedUserId) {
        throw new Error("RTCNotification event has no sender associated with it!");
    }

    // Get room-member from mx-id
    const participants = Array.from(call.participants.keys());
    const startedMember = participants.find((member) => member.userId === startedUserId);
    if (!startedMember) {
        throw new Error(`The user who started this call (${startedUserId}) is not a participant of the call`);
    }

    const startedByDisplayName = startedMember.name;

    // We know we're joined to this call if there's an active call in the room
    const isJoined = !!CallStore.instance.getActiveCall(roomId);

    const callDirection =
        MatrixClientPeg.safeGet().getUserId() === startedUserId ? CallDirection.Outgoing : CallDirection.Incoming;

    // Create the avatar vms
    const facePileViewModel = new FacePileViewModel({ roomId, size: "20px", members: participants });
    const memberAvatarViewModel = new MemberAvatarViewModel({ member: startedMember, size: "20px" });

    const room = MatrixClientPeg.safeGet().getRoom(roomId);
    if (!room) {
        throw new Error(`Cannot find room ${roomId}`);
    }
    const isJoinable = !!room
        .getLiveTimeline()
        .getState(EventTimeline.FORWARDS)
        ?.mayClientSendStateEvent(EventType.GroupCallMemberPrefix, room.client);

    const callStartTs = call.session.getOldestMembership()?.createdTs();
    if (!callStartTs) {
        throw new Error("Could not calculate callStartTs");
    }

    return {
        startedByDisplayName,
        isJoined,
        isJoinable,
        facePileViewModel,
        memberAvatarViewModel,
        callDirection,
        callStartTs,
    };
}

export class BaseOngoingCallViewModel<
    T extends CommonOngoingCallTileViewSnapshot = CommonOngoingCallTileViewSnapshot,
> extends BaseViewModel<T, Props> {
    public constructor(props: Props, extraSnapshot: Partial<T> = {}) {
        const snapshot = { ...computeSnapshot(props), ...extraSnapshot };
        super(props, snapshot as T);
        this.disposables.track(snapshot.facePileViewModel as BaseViewModel<unknown, unknown>);
        this.disposables.track(snapshot.memberAvatarViewModel as BaseViewModel<unknown, unknown>);
        this.setupListener();
    }

    private setupListener(): void {
        const call = getCallInRoom(this.props.roomId);
        this.disposables.trackListener(call, CallEvent.Participants, ((participants: Map<RoomMember, Set<string>>) => {
            this.onParticipantsChange(participants);
        }) as (...args: unknown[]) => void);
    }

    protected join(event: React.MouseEvent<HTMLButtonElement>, callType: SharedComponentsCallType): void {
        const roomId = this.props.roomId;
        const room = MatrixClientPeg.safeGet().getRoom(roomId);
        if (!room) {
            throw new Error(`Cannot find room ${roomId}`);
        }
        const type = callType === SharedComponentsCallType.Voice ? CallType.Voice : CallType.Video;
        placeCall(room, type, PlatformCallType.ElementCall, event?.shiftKey || undefined, type === CallType.Voice);
    }

    protected onParticipantsChange(participants: Map<RoomMember, Set<string>>, extraSnapshot: Partial<T> = {}): void {
        const roomId = this.props.roomId;
        const isJoined = !!CallStore.instance.getActiveCall(roomId);
        const members = Array.from(participants.keys());
        (this.getSnapshot().facePileViewModel as FacePileViewModel).updateMembers(members);
        this.snapshot.merge({ isJoined, ...extraSnapshot } as Partial<T>);
    }
}
