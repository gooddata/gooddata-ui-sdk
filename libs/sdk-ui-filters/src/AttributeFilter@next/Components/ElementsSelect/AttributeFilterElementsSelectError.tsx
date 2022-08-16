// (C) 2021-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

/**
 * @alpha
 */
export interface IAttributeFilterElementsSelectErrorProps {
    height: number;
}

export const AttributeFilterElementsSelectError: React.VFC = ({
    height,
}: IAttributeFilterElementsSelectErrorProps) => (
    <div className="gd-message error" style={{ height }}>
        <FormattedMessage id="gs.list.error" />
    </div>
);
