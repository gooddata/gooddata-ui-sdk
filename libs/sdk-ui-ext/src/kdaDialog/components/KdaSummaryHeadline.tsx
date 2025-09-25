// (C) 2025 GoodData Corporation

import cx from "classnames";

import { DateHeadline } from "./headlines/DateHeadline.js";
import { DiffHeadline } from "./headlines/DiffHeadline.js";
import { useKdaState } from "../providers/KdaState.js";

export function KdaSummaryHeadline() {
    const { state } = useKdaState();
    const item = state.rootItem;

    const diff = item.to.value - item.from.value;
    const change = diff / item.from.value;

    return (
        <div className={cx("gd-kda-key-driver-headline")}>
            <DateHeadline when={item.from.date} amount={item.formatValue(item.from.value)} />
            <DateHeadline when={item.to.date} amount={item.formatValue(item.to.value)} />
            <DiffHeadline change={change} amount={item.formatValue(diff)} />
        </div>
    );
}
