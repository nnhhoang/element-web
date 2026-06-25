/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import { type RoomMember, type MatrixEvent } from "matrix-js-sdk/src/matrix";
import EventEmitter from "events";

import { mkEvent, mkRoomMember } from "../../../../../../../../test/test-utils";

export function getMockedRtcNotificationEvent(intent: string, senderTs: number, serverTs: number): MatrixEvent {
    const mockEvent = mkEvent({
        type: "org.matrix.msc4075.rtc.notification",
        user: "@foo:m.org",
        content: {
            "m.call.intent": intent,
            "sender_ts": senderTs,
        },
        ts: serverTs,
        event: true,
        room: "!my-room:m.org",
    });
    return mockEvent;
}

export function getMember(roomId: string, userId: string, name: string): RoomMember {
    const member = mkRoomMember(roomId, userId);
    member.name = name;
    return member;
}

export class MockedCall extends EventEmitter {
    public participants: Map<RoomMember, Set<string>> = new Map([
        [getMember("!my-room:m.org", "@foo:m.org", "Foo"), new Set()],
        [getMember("!my-room:m.org", "@foo1:m.org", "Foo1"), new Set()],
        [getMember("!my-room:m.org", "@foo2:m.org", "Foo2"), new Set()],
        [getMember("!my-room:m.org", "@foo3:m.org", "Foo3"), new Set()],
    ]);

    public session = {
        getOldestMembership: () => {
            return { createdTs: () => 100 };
        },
    };
}
