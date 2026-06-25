/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import {
    type CommonOngoingCallTileViewAction,
    type DmOngoingCallTileViewSnapshot,
} from "@element-hq/web-shared-components";

import { type Props, BaseOngoingCallViewModel } from "./BaseOngoingCallTileViewModel";
import { getIntentFromEvent } from "../../common";

export class DmOngoingCallTileViewModel
    extends BaseOngoingCallViewModel<DmOngoingCallTileViewSnapshot>
    implements CommonOngoingCallTileViewAction
{
    public constructor(props: Props) {
        const callType = getIntentFromEvent(props.mxEvent);
        super(props, { callType });
    }

    public join(event: React.MouseEvent<HTMLButtonElement>): void {
        super.join(event, this.getSnapshot().callType);
    }
}
