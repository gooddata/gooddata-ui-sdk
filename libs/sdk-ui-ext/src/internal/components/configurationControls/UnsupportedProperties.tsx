// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

export default function UnsupportedProperties() {
    return (
        <div className={cx("adi-unsupported-configuration", "s-properties-unsupported")}>
            <FormattedMessage id="properties.unsupported" />
        </div>
    );
}
