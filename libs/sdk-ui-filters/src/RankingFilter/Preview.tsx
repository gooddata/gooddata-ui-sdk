// (C) 2020-2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type RankingFilterOperator } from "@gooddata/sdk-model";

import { messages } from "../locales.js";

import { type IAttributeDropdownItem, type IMeasureDropdownItem } from "./types.js";

interface IPreviewProps {
    measure?: IMeasureDropdownItem;
    attribute?: IAttributeDropdownItem;
    operator: RankingFilterOperator;
    value: number;
    enableRankingStrictLimit?: boolean;
    strictLimitOfRows?: boolean;
}

const getPreviewTemplate = (operator: RankingFilterOperator, attribute?: IAttributeDropdownItem) => {
    switch (operator) {
        case "TOP":
            return attribute ? messages["topWithAttr"].id : messages["topWithoutAttr"].id;
        case "BOTTOM":
            return attribute ? messages["bottomWithAttr"].id : messages["bottomWithoutAttr"].id;
        default:
            throw new Error(`Operator '${operator}' is not supported!`);
    }
};

export function Preview({
    operator,
    value,
    measure,
    attribute,
    enableRankingStrictLimit = false,
    strictLimitOfRows = false,
}: IPreviewProps) {
    const intl = useIntl();

    // In the strict-limit variant, the strict condition (strictLimitOfRows === true) is annotated in the
    // summary to match the dropdown naming, e.g. "Top 10 (strict) of # of Orders".
    const conditionSuffix =
        enableRankingStrictLimit && strictLimitOfRows
            ? ` ${intl.formatMessage(messages["previewStrict"])}`
            : "";

    return (
        <div className="gd-rf-preview s-rf-preview">
            <FormattedMessage
                id={getPreviewTemplate(operator, attribute)}
                tagName="span"
                values={{
                    measure: measure?.title ?? "",
                    attribute: attribute?.title,
                    operator,
                    value,
                    conditionSuffix,
                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                }}
            />
        </div>
    );
}
