// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

export default class UnsupportedProperties extends React.Component {
    public render() {
        return (
            <div className={this.getClassNames()}>
                <FormattedMessage id="properties.unsupported" />
            </div>
        );
    }

    private getClassNames() {
        return cx("adi-unsupported-configuration", "s-properties-unsupported");
    }
}
