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
import { CallDirection, type CallType } from "../../common";
import { Flex } from "../../../../../../core/utils/Flex";
import commonStyles from "../common.module.css";
import styles from "./DmOngoingCallTileView.module.css";
import { JoinButton } from "../components/JoinButton/JoinButton";
import { Duration } from "../components/Duration/Duration";
import { MemberAvatarView } from "../../../../../../core/MemberAvatar/MemberAvatarView";
import { type CommonOngoingCallTileViewSnapshot, type CommonOngoingCallTileViewAction } from "../common";
import { FacePileView } from "../../../../../../core/FacePile/FacePileView";
import { useI18n } from "../../../../../../core/i18n/i18nContext";

export interface DmOngoingCallTileViewSnapshot extends CommonOngoingCallTileViewSnapshot {
    callType: CallType;
}

export type DmOngoingCallTileViewModel = ViewModel<DmOngoingCallTileViewSnapshot> & CommonOngoingCallTileViewAction;

interface Props {
    vm: DmOngoingCallTileViewModel;
}

export function DmOngoingCallTileView(props: Props): React.ReactNode {
    const snapshot = useViewModel(props.vm);
    const { callType, callDirection, callStartTs, isJoinable, isJoined } = snapshot;
    return (
        <TileContainer>
            <Flex align="center" gap="var(--cpd-space-3x)" className={commonStyles.content}>
                <CallIcon callType={callType} />
                <Flex gap="6px" align="center" className={commonStyles.content}>
                    {callDirection === CallDirection.Incoming ? (
                        <IncomingCallContent snapshot={snapshot} />
                    ) : (
                        <OutgoingCallContent snapshot={snapshot} />
                    )}
                </Flex>
                <Duration classNames="duration" callStartTs={callStartTs} />
                {!isJoined && (
                    <JoinButton disabled={!isJoinable} callType={callType} join={(ev) => props.vm.join(ev)} />
                )}
            </Flex>
        </TileContainer>
    );
}

function IncomingCallContent({ snapshot }: { snapshot: DmOngoingCallTileViewSnapshot }): React.ReactNode {
    let content: React.ReactNode;
    const { translate: _t } = useI18n();
    if (snapshot.isJoined) {
        content = (
            <>
                <FacePileView classNames={styles.facepile} vm={snapshot.facePileViewModel} />
                <div className={commonStyles.title}>{_t("timeline|call_tile|ongoing|dm|title")}</div>
            </>
        );
    } else {
        content = (
            <>
                <MemberAvatarView classNames={styles.avatar} vm={snapshot.memberAvatarViewModel} />
                <div className={commonStyles.title}>
                    {_t("timeline|call_tile|ongoing|common|call_started_by", {
                        startedByDisplayName: snapshot.startedByDisplayName,
                    })}
                </div>
            </>
        );
    }
    return content;
}

function OutgoingCallContent({ snapshot }: { snapshot: DmOngoingCallTileViewSnapshot }): React.ReactNode {
    const { translate: _t } = useI18n();
    return (
        <>
            <MemberAvatarView classNames={styles.avatar} vm={snapshot.memberAvatarViewModel} />
            <div className={commonStyles.title}>{_t("timeline|call_tile|ongoing|dm|call_started")}</div>
        </>
    );
}
