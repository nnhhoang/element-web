/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import { CallDirection, CallType, type DmTombstoneCallTileViewSnapshot } from "@element-hq/web-shared-components";
import { type MatrixEvent, MatrixEventEvent } from "matrix-js-sdk/src/matrix";

import type { IRTCNotificationContent } from "matrix-js-sdk/src/matrixrtc";
import SettingsStore from "../../../../../../../settings/SettingsStore";
import type { GetRelationsForEvent } from "../../../../../../../components/views/rooms/EventTile";
import { MatrixClientPeg } from "../../../../../../../MatrixClientPeg";
import { getTimeFromEvent } from "./common";
import {
    RoomTombstoneCallTileViewModel,
    type RoomTombstoneCallTileViewModelProps,
} from "./RoomTombstoneCallTileViewModel";
import { getDeclinedEvents } from "../../common";

export interface DmTombstoneCallTileViewModelProps extends RoomTombstoneCallTileViewModelProps {
    /**
     * Helper to fetch related events from a given event.
     */
    getRelationsForEvent?: GetRelationsForEvent;
}

function getIntentFromEvent(event: MatrixEvent): CallType {
    const content = event.getContent<IRTCNotificationContent>();
    const intentInContent = content["m.call.intent"];
    switch (intentInContent) {
        case "audio":
            return CallType.Voice;
        case "video":
        default:
            return CallType.Video;
    }
}

function generateSnapshot(
    event: MatrixEvent,
    getRelationsForEvent?: GetRelationsForEvent,
): { snapshot: DmTombstoneCallTileViewSnapshot; declineEvent: MatrixEvent | null } {
    const type = getIntentFromEvent(event);

    // Find the mx-id of the user who started this call
    const startedUserId = event.getSender();
    if (!startedUserId) {
        throw new Error("RTCNotification event has no sender associated with it!");
    }
    const callDirection =
        MatrixClientPeg.safeGet().getUserId() === startedUserId ? CallDirection.Outgoing : CallDirection.Incoming;

    const declineEvent = getDeclinedEvents(event, getRelationsForEvent)?.[0] ?? null;
    const showTwelveHour = SettingsStore.getValue("showTwelveHourTimestamps");
    const timestamp = getTimeFromEvent(declineEvent ?? event, showTwelveHour);
    return { snapshot: { timestamp, type, callDirection, isCallDeclined: !!declineEvent }, declineEvent };
}

export class DmTombstoneCallTileViewModel extends RoomTombstoneCallTileViewModel<
    DmTombstoneCallTileViewSnapshot,
    DmTombstoneCallTileViewModelProps
> {
    /**
     * The decline event associated with this call, if any.
     */
    private declineEvent: MatrixEvent | null;

    public constructor(props: DmTombstoneCallTileViewModelProps) {
        const { snapshot, declineEvent } = generateSnapshot(props.mxEvent, props.getRelationsForEvent);
        super(props, snapshot);
        this.declineEvent = declineEvent;

        // When a relation is added to the event, recompute the state.
        this.disposables.trackListener(props.mxEvent, MatrixEventEvent.RelationsCreated, () => {
            const { declineEvent, snapshot } = generateSnapshot(props.mxEvent, props.getRelationsForEvent);
            this.declineEvent = declineEvent;
            this.snapshot.set(snapshot);
        });
    }

    protected getTimestamp(showTwelveHour: boolean): string {
        return getTimeFromEvent(this.declineEvent ?? this.props.mxEvent, showTwelveHour);
    }
}
