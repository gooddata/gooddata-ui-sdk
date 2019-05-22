// (C) 2019 GoodData Corporation
import * as React from "react";
import { InjectedIntl } from "react-intl";
import * as classNames from "classnames";
import { getTranslation } from "../../utils/translations";

export interface IUnsupportedPropertiesProps {
    intl: InjectedIntl;
}

export default class UnsupportedProperties extends React.Component<IUnsupportedPropertiesProps, null> {
    constructor(props: IUnsupportedPropertiesProps) {
        super(props);
    }

    public render() {
        return (
            <div className={this.getClassNames()}>
                {getTranslation("properties.unsupported", this.props.intl)}
            </div>
        );
    }

    private getClassNames() {
        return classNames("adi-unsupported-configuration", "s-properties-unsupported");
    }
}
