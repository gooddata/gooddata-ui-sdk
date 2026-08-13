// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import type { IInteractionStepDetailRow } from "../data/types.js";
import { e } from "../intelligenceBem.js";

import { DetailRowValue } from "./DetailRowValue.js";

export interface IIntelligenceDetailRowsProps {
    rows: IInteractionStepDetailRow[];
}

/**
 * Renders an occurrence's authored key/value rows generically — the same rendering for every
 * category, with no per-category switch. A row's value is plain text, a single count+list, or
 * several independent count+lists stacked under one label.
 */
export function IntelligenceDetailRows({ rows }: IIntelligenceDetailRowsProps) {
    const intl = useIntl();

    return (
        <dl className={e("detail-rows", { scrollable: true })}>
            {rows.map((row, index) => (
                <div key={index} className={e("detail-rows__row")}>
                    <dt className={e("detail-rows__label")}>{intl.formatMessage({ id: row.labelId })}</dt>
                    <dd className={e("detail-rows__value")}>
                        <DetailRowValue value={row.value} />
                    </dd>
                </div>
            ))}
        </dl>
    );
}
