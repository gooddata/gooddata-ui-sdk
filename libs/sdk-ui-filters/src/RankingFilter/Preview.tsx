// (C) 2020-2022 GoodData Corporation
import React, { ReactNode } from "react";
import { RankingFilterOperator } from "@gooddata/sdk-model";
import { FormattedMessage } from "react-intl";

import { IMeasureDropdownItem, IAttributeDropdownItem } from "./types.js";
import { messages } from "../locales.js";

interface IPreviewProps {
    measure: IMeasureDropdownItem;
    attribute?: IAttributeDropdownItem;
    operator: RankingFilterOperator;
    value: number;
}

const getPreviewTemplate = (operator: RankingFilterOperator, attribute?: IAttributeDropdownItem) => {
    switch (operator) {
        case "TOP":
            return attribute ? messages.topWithAttr.id : messages.topWithoutAttr.id;
        case "BOTTOM":
            return attribute ? messages.bottomWithAttr.id : messages.bottomWithoutAttr.id;
        default:
            throw new Error(`Operator '${operator}' is not supported!`);
    }
};

export const Preview: React.FC<IPreviewProps> = ({ operator, value, measure, attribute }) => (
    <div className="gd-rf-preview s-rf-preview">
        <FormattedMessage
            id={getPreviewTemplate(operator, attribute)}
            tagName="span"
            values={{
                measure: measure.title,
                attribute: attribute?.title,
                operator,
                value,
                strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
            }}
        />
    </div>
);
