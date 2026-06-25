/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import { Direction, EventType, type MatrixEvent, RelationType } from "matrix-js-sdk/src/matrix";
import { BaseViewModel, type ViewModel, type RootCallTileViewSnapshot } from "@element-hq/web-shared-components";

import type { GetRelationsForEvent } from "../../../../../components/views/rooms/EventTile";
import { MatrixClientPeg } from "../../../../../MatrixClientPeg";
import { CallStore } from "../../../../../stores/CallStore";
import { RoomOngoingCallTileViewModel } from "./tiles/ongoing/RoomOngoingCallTileViewModel";
import { DmOngoingCallTileViewModel } from "./tiles/ongoing/DmOngoingCallTileViewModel";
import { DmTombstoneCallTileViewModel } from "./tiles/tombstone/DmTombstoneCallTileViewModel";
import { RoomTombstoneCallTileViewModel } from "./tiles/tombstone/RoomTombstoneCallTileViewModel";
import { CallEvent } from "../../../../../models/Call";

interface Props {
    /**
     * Event of type `org.matrix.msc4075.rtc.notification`.
     */
    mxEvent: MatrixEvent;
    /**
     * Helper to fetch related events from a given event.
     */
    getRelationsForEvent?: GetRelationsForEvent;
}

export function getCallMemberEvent(
    event: MatrixEvent,
    getRelationsForEvent?: GetRelationsForEvent,
): MatrixEvent | null {
    const eventId = event.getId();
    if (eventId && getRelationsForEvent) {
        const relations = getRelationsForEvent(
            eventId,
            RelationType.Reference,
            EventType.GroupCallMemberPrefix,
        )?.getRelations();
        if (relations) return relations[0];
    }
    return null;
}

function computeSnapshot(props: Props): RootCallTileViewSnapshot {
    const cli = MatrixClientPeg.safeGet();
    const notificationEvent = props.mxEvent;

    // Get the room where this call is taking place
    const roomId = props.mxEvent.getRoomId();
    if (!roomId) throw new Error("Notification event does not have associated room-id");
    const room = cli.getRoom(roomId);
    if (!room) throw new Error(`No room with id ${roomId}`);

    // Get the last call member event in the timeline
    const stateEvents = room
        ?.getLiveTimeline()
        .getState(Direction.Forward)
        ?.getStateEvents(EventType.GroupCallMemberPrefix);
    if (!stateEvents) throw new Error("No state events in this room");

    // Check if this rtc notification event corresponds to the latest state
    const correspondsToLatestState = stateEvents.some(
        (event) => notificationEvent.getRelation()?.event_id === event.getId(),
    );

    // Check if there's an ongoing call
    const hasOngoingCall = !!CallStore.instance.getCall(roomId);

    // This is the same logic used for hiding/showing the voice call button.
    const isDmRoom = room.getMembers().length <= 2;

    /**
     * We know we should render the ongoing tile if:
     * - There's an ongoing call in this room
     * - This is the last call tile in the room
     */
    if (correspondsToLatestState && hasOngoingCall) {
        if (isDmRoom) {
            return {
                tileType: "ongoing-call-dm",
                tileViewModel: new DmOngoingCallTileViewModel({ mxEvent: notificationEvent, roomId }),
            };
        }
        return {
            tileType: "ongoing-call-room",
            tileViewModel: new RoomOngoingCallTileViewModel({
                roomId,
                mxEvent: notificationEvent,
                getRelationsForEvent: props.getRelationsForEvent,
            }),
        };
    }

    if (isDmRoom) {
        return {
            tileType: "tombstone-call-dm",
            tileViewModel: new DmTombstoneCallTileViewModel({
                mxEvent: notificationEvent,
                getRelationsForEvent: props.getRelationsForEvent,
            }),
        };
    } else
        return {
            tileType: "tombstone-call-room",
            tileViewModel: new RoomTombstoneCallTileViewModel({ mxEvent: notificationEvent }),
        };
}

export class RootCallTileViewModel extends BaseViewModel<RootCallTileViewSnapshot, Props> {
    public constructor(props: Props) {
        super(props, computeSnapshot(props));
        this.trackViewModel(this.getSnapshot().tileViewModel);

        if (["ongoing-call-dm", "ongoing-call-room"].includes(this.getSnapshot().tileType)) {
            // Add listeners so that this tile updates when call is finished.
            const roomId = props.mxEvent.getRoomId();
            if (!roomId) throw new Error("Notification event does not have associated room-id");
            const call = CallStore.instance.getCall(roomId);
            if (call) {
                this.disposables.trackListener(call, CallEvent.Destroy, () => {
                    const snapshot = computeSnapshot(props);
                    this.trackViewModel(snapshot.tileViewModel);
                    this.snapshot.set(snapshot);
                });
            }
        }
    }

    private trackViewModel(vm: ViewModel<unknown>): void {
        // ViewModel type has no dispose method, so this needs a type assertion.
        this.disposables.track(vm as BaseViewModel<unknown, unknown>);
    }
}
