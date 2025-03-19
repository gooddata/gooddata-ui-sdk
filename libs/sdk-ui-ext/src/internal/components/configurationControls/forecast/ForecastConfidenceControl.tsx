// (C) 2019-2024 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import DropdownControl from "../DropdownControl.js";
import { confidenceDropdownItems } from "../../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

export interface IForecastConfidenceControl {
    disabled: boolean;
    value: number;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

class ForecastConfidenceControl extends React.PureComponent<
    IForecastConfidenceControl & WrappedComponentProps
> {
    public render() {
        return (
            <DropdownControl
                value={this.props.value}
                valuePath="forecast.confidence"
                labelText={messages.forecastConfidence.id}
                disabled={this.props.disabled}
                properties={this.props.properties}
                pushData={this.props.pushData}
                items={this.generateDropdownItems()}
                showDisabledMessage={this.props.showDisabledMessage}
            />
        );
    }

    private generateDropdownItems() {
        return getTranslatedDropdownItems(confidenceDropdownItems, this.props.intl);
    }
}

export default injectIntl(ForecastConfidenceControl);
