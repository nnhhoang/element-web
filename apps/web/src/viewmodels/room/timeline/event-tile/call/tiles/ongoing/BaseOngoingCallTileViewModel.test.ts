/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

// @vitest-environment happy-dom

import { test, describe, vi, expect } from "vitest";
import { type MatrixEvent } from "matrix-js-sdk/src/matrix";

import { BaseOngoingCallViewModel } from "./BaseOngoingCallTileViewModel";
import { type FacePileViewModel } from "../../../../../../../components/viewmodels/avatars/FacePileViewModel";
import { getMember, MockedCall, getMockedRtcNotificationEvent } from "./mocks";
import { mkRoom, stubClient } from "../../../../../../../../test/test-utils";
import { type ElementCall } from "../../../../../../../models/Call";
import { CallStore } from "../../../../../../../stores/CallStore";

vi.mock(import("../../../../../../../stores/CallStore"), () => {
    return {
        CallStore: class {
            public static get instance() {
                return {
                    getCall: vi.fn(),
                    getActiveCall: vi.fn(),
                } as unknown as CallStore;
            }
        } as unknown as typeof CallStore,
    };
});

export function getMocked(intent: "audio" | "video" = "audio"): { mxEvent: MatrixEvent; call: ElementCall } {
    const cli = stubClient();
    mkRoom(cli, "!my-room:m.org");
    vi.spyOn(cli, "getUserId").mockReturnValue("@foo4:m.org");
    const call = new MockedCall() as ElementCall;
    vi.spyOn(CallStore.instance, "getCall").mockReturnValue(call);
    vi.spyOn(CallStore.instance, "getActiveCall").mockReturnValue(null);
    const mxEvent = getMockedRtcNotificationEvent(intent, 1752583130365, 1752583130365);
    return { mxEvent, call };
}

describe("BaseOngoingCallViewModel", () => {
    test("should have correct initial state", () => {
        const { mxEvent } = getMocked();
        const vm = new BaseOngoingCallViewModel({ mxEvent, roomId: "!my-room:m.org" });
        const snapshot = vm.getSnapshot();
        expect(snapshot.startedByDisplayName).toStrictEqual("Foo");
        expect(snapshot.isJoined).toStrictEqual(false);
        expect(snapshot.callStartTs).toStrictEqual(100);
        expect(snapshot.callDirection).toStrictEqual("Incoming");
    });

    test("should recompute state on call event", () => {
        const { mxEvent, call } = getMocked();
        const vm = new BaseOngoingCallViewModel({ mxEvent, roomId: "!my-room:m.org" });
        const snapshot = vm.getSnapshot();
        const facePileViewModel = snapshot.facePileViewModel as FacePileViewModel;
        const spy = vi.spyOn(facePileViewModel, "updateMembers");

        expect(snapshot.isJoined).toStrictEqual(false);
        expect(facePileViewModel.updateMembers).not.toHaveBeenCalled();

        vi.spyOn(CallStore.instance, "getActiveCall").mockReturnValue(call);
        const newParticipantMap = new Map([
            [getMember("!my-room:m.org", "@foo:m.org", "Foo"), new Set()],
            [getMember("!my-room:m.org", "@foo4:m.org", "Foo3"), new Set()],
        ]);

        (call as MockedCall).emit("participants", newParticipantMap);

        expect(vm.getSnapshot().isJoined).toStrictEqual(true);
        const argument = spy.mock.calls[0][0];
        expect(argument.map((r) => r.userId)).toEqual(["@foo:m.org", "@foo4:m.org"]);
    });
});
