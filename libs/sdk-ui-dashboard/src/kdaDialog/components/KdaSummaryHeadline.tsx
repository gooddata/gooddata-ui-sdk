// (C) 2025 GoodData Corporation

import cx from "classnames";

import { DateHeadline } from "./headlines/DateHeadline.js";
import { DiffHeadline } from "./headlines/DiffHeadline.js";
import { useKdaState } from "../providers/KdaState.js";
import { formatValue } from "../utils.js";

export function KdaSummaryHeadline() {
    const { state } = useKdaState();
    const definition = state.definition;

    if (!definition) {
        return null;
    }

    const [from, to] = definition.range;
    const diff = to.value - from.value;
    const change = diff / from.value;

    return (
        <div className={cx("gd-kda-key-driver-headline")}>
            <DateHeadline when={from.date} amount={formatValue(definition, from.value, state.separators)} />
            <DateHeadline when={to.date} amount={formatValue(definition, to.value, state.separators)} />
            <DiffHeadline change={change} amount={formatValue(definition, diff, state.separators)} />
        </div>
    );
}
