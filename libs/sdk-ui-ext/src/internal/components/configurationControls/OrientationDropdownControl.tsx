// (C) 2023 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ChartOrientationType } from "@gooddata/sdk-ui-charts";
import { IPushData } from "@gooddata/sdk-ui";

import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";
import { orientationDropdownItems } from "../../constants/dropdowns.js";
import DropdownControl from "./DropdownControl.js";

export interface IOrientationDropdownControl {
    disabled: boolean;
    value: ChartOrientationType;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: IPushData) => void;
}

class OrientationDropdownControl extends React.PureComponent<
    IOrientationDropdownControl & WrappedComponentProps
> {
    public render() {
        return (
            <DropdownControl
                value={this.props.value}
                valuePath="orientation.position"
                labelText={messages.orientationTitle.id}
                disabled={this.props.disabled}
                properties={this.props.properties}
                pushData={this.props.pushData}
                items={this.generateDropdownItems()}
                showDisabledMessage={this.props.showDisabledMessage}
            />
        );
    }

    private generateDropdownItems() {
        return getTranslatedDropdownItems(orientationDropdownItems, this.props.intl);
    }
}

export default injectIntl(OrientationDropdownControl);
