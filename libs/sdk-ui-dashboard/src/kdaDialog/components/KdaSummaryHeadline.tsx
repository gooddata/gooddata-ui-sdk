// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";

import { DateHeadline } from "./headlines/DateHeadline.js";
import { DiffHeadline } from "./headlines/DiffHeadline.js";
import { useDateAttribute } from "../hooks/useDateAttribute.js";
import { KdaDateOptions } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";
import { formatTitle, formatValue } from "../utils.js";

export function KdaSummaryHeadline() {
    const { state } = useKdaState();
    const definition = state.definition;

    const def = state.definition;
    const dateAttributeFinder = useDateAttribute();

    const [from, to] = definition?.range ?? [null, null];

    const fromOpts = useMemo(() => {
        return {
            dateAttribute: dateAttributeFinder(def?.dateAttribute),
            period: def?.type ?? "previous_period",
            range: [from, from],
        } as KdaDateOptions;
    }, [dateAttributeFinder, def?.dateAttribute, def?.type, from]);

    const toOpts = useMemo(() => {
        return {
            dateAttribute: dateAttributeFinder(def?.dateAttribute),
            period: def?.type ?? "previous_period",
            range: [to, to],
        } as KdaDateOptions;
    }, [dateAttributeFinder, def?.dateAttribute, def?.type, to]);

    if (!definition || from?.value === undefined || to?.value === undefined) {
        return null;
    }

    const diff = to.value - from.value;
    const change = diff / from.value;

    return (
        <div className={cx("gd-kda-key-driver-headline")}>
            <DateHeadline
                when={formatTitle(fromOpts, "-")}
                amount={formatValue(definition, from.value, state.separators)}
            />
            <DateHeadline
                when={formatTitle(toOpts, "-")}
                amount={formatValue(definition, to.value, state.separators)}
            />
            <DiffHeadline change={change} amount={formatValue(definition, diff, state.separators)} />
        </div>
    );
}
