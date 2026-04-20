// (C) 2020-2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { type RankingFilterOperator } from "@gooddata/sdk-model";

import { messages } from "../locales.js";
import { type IAttributeDropdownItem, type IMeasureDropdownItem } from "./types.js";

interface IPreviewProps {
    measure?: IMeasureDropdownItem;
    attribute?: IAttributeDropdownItem;
    operator: RankingFilterOperator;
    value: number;
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

export function Preview({ operator, value, measure, attribute }: IPreviewProps) {
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
                    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                }}
            />
        </div>
    );
}
