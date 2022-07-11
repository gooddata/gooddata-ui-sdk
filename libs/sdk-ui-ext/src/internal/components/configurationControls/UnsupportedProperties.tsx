// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

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
