/*
 * Copyright 2026 Element Creations Ltd.
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
 * Please see LICENSE files in the repository root for full details.
 */

import React, { useCallback, useEffect, useState } from "react";
import classNames from "classnames";

import styles from "./Duration.module.css";

interface Props {
    callStartTs: number;
    classNames?: string;
}

export function Duration(props: Props): React.ReactNode {
    const [elapsed, setElapsed] = useState<number>(0);

    const computeElapsed = useCallback(() => {
        const timeElapsedInMs = Date.now() - props.callStartTs;
        const timeElapsedInSeconds = Math.floor(timeElapsedInMs * 0.001);
        setElapsed(timeElapsedInSeconds);
    }, [props.callStartTs]);

    const onTick = useCallback(() => {
        computeElapsed();
    }, [computeElapsed]);

    useEffect(() => {
        computeElapsed();
        const intervalRef = setInterval(onTick, 1000);
        return () => {
            clearInterval(intervalRef);
        };
    }, [computeElapsed, onTick]);

    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    const elapsedString = `(${String(minutes).padStart(1, "0")}:${String(seconds).padStart(2, "0")})`;

    const classes = classNames(styles.container, props.classNames);

    return <div className={classes}>{elapsedString}</div>;
}
