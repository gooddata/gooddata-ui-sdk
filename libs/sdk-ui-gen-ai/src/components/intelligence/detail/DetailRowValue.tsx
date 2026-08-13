// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import type { IInteractionStepDetailList, IInteractionStepDetailRowValue } from "../data/types.js";
import { resolveMessage } from "../format/resolveMessage.js";
import { e } from "../intelligenceBem.js";

function DetailList({
    heading,
    headingId,
    headingValues,
    items,
    truncatedCount,
    bulleted = true,
}: IInteractionStepDetailList) {
    const intl = useIntl();

    return (
        <div className={e("detail-rows__list")}>
            {heading ? (
                <div className={e("detail-rows__list-heading")}>
                    {resolveMessage(intl, headingId, heading, headingValues)}
                </div>
            ) : null}
            <ul className={e("detail-rows__list-items", { plain: !bulleted })}>
                {items.map((item, index) => (
                    <li key={index}>
                        {item.label}
                        {item.meta ? (
                            <span className={e("detail-rows__list-item-meta")}>
                                {" "}
                                {intl.formatMessage({ id: item.meta.id }, item.meta.values)}
                            </span>
                        ) : null}
                    </li>
                ))}
            </ul>
            {truncatedCount ? (
                <div className={e("detail-rows__list-truncated")}>
                    {intl.formatMessage(
                        { id: "gd.gen-ai.interactionIntelligence.detail.andMore" },
                        { count: truncatedCount },
                    )}
                </div>
            ) : null}
        </div>
    );
}

export interface IDetailRowValueProps {
    value: IInteractionStepDetailRowValue;
}

/**
 * Renders one detail-row value generically — text, a single count+list, or several independent
 * count+lists stacked together.
 */
export function DetailRowValue({ value }: IDetailRowValueProps) {
    const intl = useIntl();

    if (value.kind === "text") {
        return resolveMessage(intl, value.textId, value.text);
    }
    if (value.kind === "list") {
        return <DetailList {...value} />;
    }
    return (
        <>
            {value.groups.map((group, index) => (
                <DetailList key={index} {...group} />
            ))}
        </>
    );
}
