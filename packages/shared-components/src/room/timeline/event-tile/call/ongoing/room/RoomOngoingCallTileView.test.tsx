/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import React from "react";
import { render } from "@test-utils";

import * as Stories from "./RoomOngoingCallTileView.stories";

const { RoomCallIgnored, RoomCallJoined, RoomCallStarted } = composeStories(Stories);

describe("RoomOngoingCallTileView", () => {
    describe("renders the tile", () => {
        it("RoomCallIgnored", () => {
            const { container } = render(<RoomCallIgnored />);
            expect(container).toMatchSnapshot();
        });

        it("RoomCallJoined", () => {
            const { container } = render(<RoomCallJoined />);
            expect(container).toMatchSnapshot();
        });

        it("RoomCallStarted", () => {
            const { container } = render(<RoomCallStarted />);
            expect(container).toMatchSnapshot();
        });
    });
});
