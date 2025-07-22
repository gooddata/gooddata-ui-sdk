// (C) 2019-2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

export default function UnsupportedProperties() {
    return (
        <div className={cx("adi-unsupported-configuration", "s-properties-unsupported")}>
            <FormattedMessage id="properties.unsupported" />
        </div>
    );
}
