// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { confidenceDropdownItems } from "../../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import DropdownControl from "../DropdownControl.js";

export interface IForecastConfidenceControl {
    disabled: boolean;
    value: number;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

const ForecastConfidenceControl = memo(function ForecastConfidenceControl(
    props: IForecastConfidenceControl & WrappedComponentProps,
) {
    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(confidenceDropdownItems, props.intl);
    };

    return (
        <DropdownControl
            value={props.value}
            valuePath="forecast.confidence"
            labelText={messages["forecastConfidence"].id}
            disabled={props.disabled}
            properties={props.properties}
            pushData={props.pushData}
            items={generateDropdownItems()}
            showDisabledMessage={props.showDisabledMessage}
        />
    );
});

export default injectIntl(ForecastConfidenceControl);
