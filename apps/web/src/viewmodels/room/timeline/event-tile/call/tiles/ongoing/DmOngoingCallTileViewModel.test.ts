/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

// @vitest-environment happy-dom

import { test, describe, vi, expect } from "vitest";
import { CallType } from "@element-hq/web-shared-components";

import { DmOngoingCallTileViewModel } from "./DmOngoingCallTileViewModel";
import { getMocked } from "./mocks";

vi.mock(import("../../../../../../../utils/room/placeCall"), () => {
    return {
        placeCall: vi.fn(),
    };
});

describe("BaseOngoingCallViewModel", () => {
    test("should have audio intent", () => {
        const { mxEvent } = getMocked();
        const vm = new DmOngoingCallTileViewModel({ mxEvent, roomId: "!my-room:m.org" });
        const snapshot = vm.getSnapshot();
        expect(snapshot.callType).toStrictEqual(CallType.Voice);
    });
});
