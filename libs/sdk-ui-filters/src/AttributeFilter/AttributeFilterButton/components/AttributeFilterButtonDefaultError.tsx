// (C) 2022 GoodData Corporation
import React from "react";
import { injectIntl } from "react-intl";

const DefaultFilterError: React.FC = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error s-button-error">{text}</div>;
});

export default DefaultFilterError;
