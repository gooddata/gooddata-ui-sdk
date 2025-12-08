// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { confidenceDropdownItems } from "../../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { DropdownControl } from "../DropdownControl.js";

export interface IForecastConfidenceControl {
    disabled: boolean;
    value: number;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

export const ForecastConfidenceControl = memo(function ForecastConfidenceControl(
    props: IForecastConfidenceControl,
) {
    const intl = useIntl();
    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(confidenceDropdownItems, intl);
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
