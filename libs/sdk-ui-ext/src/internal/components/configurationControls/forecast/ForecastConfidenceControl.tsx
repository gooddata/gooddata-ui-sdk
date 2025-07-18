// (C) 2019-2025 GoodData Corporation
import { memo } from "react";
import { useIntl } from "react-intl";

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

const ForecastConfidenceControl = memo(function ForecastConfidenceControl({
    value,
    disabled,
    properties,
    pushData,
    showDisabledMessage,
}: IForecastConfidenceControl) {
    const intl = useIntl();

    const generateDropdownItems = () => {
        return getTranslatedDropdownItems(confidenceDropdownItems, intl);
    };

    return (
        <DropdownControl
            value={value}
            valuePath="forecast.confidence"
            labelText={messages.forecastConfidence.id}
            disabled={disabled}
            properties={properties}
            pushData={pushData}
            items={generateDropdownItems()}
            showDisabledMessage={showDisabledMessage}
        />
    );
});

export default ForecastConfidenceControl;
