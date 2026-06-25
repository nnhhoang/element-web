/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { type DmOngoingCallTileViewSnapshot, DmOngoingCallTileView } from "./DmOngoingCallTileView";
import { useMockedViewModel } from "../../../../../../core/viewmodel";
import { withViewDocs } from "../../../../../../../.storybook/withViewDocs";
import { type CommonOngoingCallTileViewAction } from "../common";
import { CallDirection, CallType } from "../../common";
import profileLink1 from "../../../../../../../static/profile-pics/profile1.png";
import profileLink2 from "../../../../../../../static/profile-pics/profile2.png";
import { MockFacePileViewModel, MockMemberAvatarViewModel } from "../mocks";

const DmOngoingCallTileViewWrapperImpl = ({
    join,
    ...rest
}: DmOngoingCallTileViewSnapshot & CommonOngoingCallTileViewAction): React.ReactNode => {
    const vm = useMockedViewModel(rest, { join });
    return <DmOngoingCallTileView vm={vm} />;
};

const DmOngoingCallTileViewWrapper = withViewDocs(DmOngoingCallTileViewWrapperImpl, DmOngoingCallTileView);

const meta = {
    title: "Timeline/Timeline Event/Call/Ongoing/DmOngoingCallTileView",
    component: DmOngoingCallTileViewWrapper,
    tags: ["autodocs"],
    argTypes: {
        callDirection: {
            options: [CallDirection.Incoming, CallDirection.Outgoing],
            control: { type: "radio" },
        },
        callType: {
            options: [CallType.Voice, CallType.Video],
            control: { type: "radio" },
        },
    },
    args: {
        callDirection: CallDirection.Incoming,
        startedByDisplayName: "Bob",
        callStartTs: Date.now(),
        isJoinable: true,
        isJoined: false,
        join: () => {},
        memberAvatarViewModel: new MockMemberAvatarViewModel({ id: "@bob:m.org", name: "Bob", url: profileLink1 }),
        facePileViewModel: new MockFacePileViewModel([
            { id: "@bob:m.org", name: "Bob", url: profileLink1 },
            { id: "@riley:m.org", name: "Riley", url: profileLink2 },
        ]),
        callType: CallType.Voice,
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/design/rTaQE2nIUSLav4Tg3nozq7/Compound-Web-Components?node-id=11217-3901&t=OvT1LOc5wH4kXt0a-4",
        },
        visOptions: {
            mask: [".duration"],
        },
    },
} satisfies Meta<typeof DmOngoingCallTileViewWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const IncomingVoiceCall: Story = {
    args: {
        callDirection: CallDirection.Incoming,
        callType: CallType.Voice,
    },
};

export const IncomingVideoCall: Story = {
    args: {
        callDirection: CallDirection.Incoming,
        callType: CallType.Video,
    },
};

export const OutgoingVoiceCall: Story = {
    args: {
        callDirection: CallDirection.Outgoing,
        callType: CallType.Voice,
    },
};

export const OutgoingVideoCall: Story = {
    args: {
        callDirection: CallDirection.Outgoing,
        callType: CallType.Video,
    },
};

export const JoinedVoiceCall: Story = {
    args: {
        callType: CallType.Voice,
        isJoined: true,
    },
};

export const JoinedVideoCall: Story = {
    args: {
        callType: CallType.Video,
        isJoined: true,
    },
};
