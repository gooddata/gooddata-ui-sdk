// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

export const AttributeFilterError: React.VFC = () => {
    return (
        <div className="gd-message error s-button-error">
            <FormattedMessage id="gs.filter.error" />
        </div>
    );
};
