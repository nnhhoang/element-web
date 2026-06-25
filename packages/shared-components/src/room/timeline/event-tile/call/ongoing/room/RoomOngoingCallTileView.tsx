/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React from "react";

import { useViewModel, type ViewModel } from "../../../../../../core/viewmodel";
import { TileContainer } from "../components/TileContainer/TileContainer";
import { CallIcon } from "../components/CallIcon/CallIcon";
import { CallType } from "../../common";
import { Flex } from "../../../../../../core/utils/Flex";
import commonStyles from "../common.module.css";
import styles from "./RoomOngoingCallTileView.module.css";
import { JoinButton } from "../components/JoinButton/JoinButton";
import { Duration } from "../components/Duration/Duration";
import { MemberAvatarView } from "../../../../../../core/MemberAvatar/MemberAvatarView";
import { FacePileView } from "../../../../../../core/FacePile/FacePileView";
import type { CommonOngoingCallTileViewAction, CommonOngoingCallTileViewSnapshot } from "../common";
import { useI18n } from "../../../../../../core/i18n/i18nContext";

export interface RoomOngoingCallTileViewSnapshot extends CommonOngoingCallTileViewSnapshot {
    /**
     * The total number of participants in this call.
     */
    totalParticipants: number;

    /**
     * Whether the user ignored this call.
     */
    isCallIgnored?: boolean;
}

export type RoomCallStartedTileViewModel = ViewModel<RoomOngoingCallTileViewSnapshot> & CommonOngoingCallTileViewAction;

interface Props {
    vm: RoomCallStartedTileViewModel;
}

export function RoomOngoingCallTileView(props: Props): React.ReactNode {
    const snapshot = useViewModel(props.vm);
    const { callStartTs, isJoinable, isJoined, isCallIgnored } = snapshot;
    const { translate: _t } = useI18n();
    return (
        <TileContainer>
            <Flex align="center" gap="var(--cpd-space-3x)" className={commonStyles.content}>
                <CallIcon callType={CallType.Video} />
                <Flex direction="column" className={commonStyles.content}>
                    <div className={commonStyles.title}>{_t("timeline|call_tile|ongoing|room|title")}</div>

                    {isJoined || isCallIgnored ? (
                        <CallJoinedOrIgnoredContent snapshot={snapshot} />
                    ) : (
                        <CallNotJoinedContent snapshot={snapshot} />
                    )}
                </Flex>
                <Duration classNames="duration" callStartTs={callStartTs} />
                {!isJoined && (
                    <JoinButton
                        callType={CallType.Video}
                        disabled={!isJoinable}
                        join={(event) => {
                            props.vm.join(event);
                        }}
                    />
                )}
            </Flex>
        </TileContainer>
    );
}

export function CallJoinedOrIgnoredContent({
    snapshot,
}: {
    snapshot: RoomOngoingCallTileViewSnapshot;
}): React.ReactNode {
    const { facePileViewModel, totalParticipants } = snapshot;
    const { translate: _t } = useI18n();
    if (!facePileViewModel) {
        throw new Error("CallJoinedOrIgnoredContent component cannot be rendered without facePileViewModel");
    }
    const joinedCount = totalParticipants - 3;
    return (
        <Flex className={styles.subContainer} gap="6px" align="center">
            <FacePileView vm={facePileViewModel} />
            {joinedCount > 0 ? "+" + _t("timeline|call_tile|ongoing|room|join_count", { joinedCount }) : null}
        </Flex>
    );
}

export function CallNotJoinedContent({ snapshot }: { snapshot: RoomOngoingCallTileViewSnapshot }): React.ReactNode {
    const { memberAvatarViewModel, startedByDisplayName } = snapshot;
    const { translate: _t } = useI18n();
    if (!memberAvatarViewModel) {
        throw new Error("CallNotJoinedContent component cannot be rendered without facePileViewModel");
    }
    return (
        <Flex className={styles.subContainer} gap="6px" align="center">
            <MemberAvatarView vm={memberAvatarViewModel} />
            <div>{_t("timeline|call_tile|ongoing|common|call_started_by", { startedByDisplayName })}</div>
        </Flex>
    );
}
