// (C) 2022-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type ITab } from "../../../shared/Tabs/Tab.js";
import { type IMetricInfo } from "../metricState.data.js";

export function useDirtyChanged(
    tabs: Array<ITab<IMetricInfo>>,
    onDirtyChanged?: (dirty: boolean) => void,
): void {
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        const isDirty = tabs.findIndex((tab) => tab.states?.dirty) !== -1;
        if (isDirty != dirty) {
            setDirty(isDirty);
        }
    }, [tabs, dirty]);

    useEffect(() => {
        if (onDirtyChanged) {
            onDirtyChanged(dirty);
        }
    }, [dirty, onDirtyChanged]);
}
