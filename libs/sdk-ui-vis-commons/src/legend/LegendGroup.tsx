// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";

import { type ILegendGroup } from "./types.js";

export function LegendGroup({
    item,
    width,
    children,
}: {
    item: ILegendGroup;
    width?: number;
    children?: ReactNode;
}): ReactNode {
    const intl = useIntl();

    const { data, labelKey } = item;

    const style = width ? { width: `${width}px` } : {};
    const values = (data || []).reduce((result: { [index: number]: string }, key: string, index: number) => {
        result[index] = intl.formatMessage(messages[key as keyof typeof messages]);
        return result;
    }, {});

    const labelId = useIdPrefixed("legend-group-label");

    return (
        <div className="legend-group" role={"group"} aria-labelledby={labelId}>
            <div
                id={labelId}
                style={style}
                className="series-axis-indicator"
                data-testid={"legend-axis-indicator"}
            >
                <div className="series-text">
                    {intl.formatMessage(messages[labelKey as keyof typeof messages], values)}
                    {intl.formatMessage(messages["colon"])}
                </div>
            </div>
            {children}
        </div>
    );
}
