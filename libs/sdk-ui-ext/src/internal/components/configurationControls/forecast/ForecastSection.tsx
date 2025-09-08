// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

import noop from "lodash/noop.js";
import { FormattedMessage } from "react-intl";

import { Message } from "@gooddata/sdk-ui-kit";

import ForecastConfidenceControl from "./ForecastConfidenceControl.js";
import { messages } from "../../../../locales.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import CheckboxControl from "../CheckboxControl.js";
import ConfigSection from "../ConfigSection.js";
import InputControl from "../InputControl.js";

export interface IForecastSection {
    controlsDisabled: boolean;
    enabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    defaultForecastEnabled?: boolean;
    pushData: (data: any) => any;
}

const ForecastSection = memo(function ForecastSection({
    controlsDisabled = false,
    enabled = false,
    properties = {},
    propertiesMeta = {},
    defaultForecastEnabled = false,
    pushData = noop,
}: IForecastSection) {
    const forecastEnabled = properties?.controls?.["forecast"]?.enabled ?? defaultForecastEnabled;
    const forecastConfidence = properties?.controls?.["forecast"]?.confidence ?? 0.95;
    const forecastPeriod = properties?.controls?.["forecast"]?.period ?? 3;
    const forecastSeasonal = properties?.controls?.["forecast"]?.seasonal ?? false;
    const forecastToggleDisabledByVisualization = !(propertiesMeta?.forecast_enabled ?? true);
    const slicedForecast = propertiesMeta?.slicedForecast ?? false;

    const toggleDisabled = controlsDisabled || forecastToggleDisabledByVisualization || !enabled;
    const forecastControlsDisabled = !forecastEnabled || toggleDisabled;
    const showDisabledMessage = controlsDisabled || forecastToggleDisabledByVisualization || !enabled;

    return (
        <ConfigSection
            id="forecast_section"
            valuePath="forecast.enabled"
            className="gd-forecast-section"
            title={messages["forecastTitle"].id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            canBeToggled={true}
            toggleDisabled={toggleDisabled}
            toggledOn={forecastEnabled}
            pushData={pushData}
            showDisabledMessage={showDisabledMessage}
            toggleMessageId={messages["forecastDisabledTooltip"].id}
        >
            <InputControl
                value={forecastPeriod}
                valuePath="forecast.period"
                labelText={messages["forecastPeriod"].id}
                placeholder={messages["forecastPeriodPlaceholder"].id}
                disabled={forecastControlsDisabled}
                properties={properties}
                pushData={pushData}
            />
            <ForecastConfidenceControl
                disabled={forecastControlsDisabled}
                value={forecastConfidence}
                showDisabledMessage={showDisabledMessage}
                properties={properties}
                pushData={pushData}
            />
            <CheckboxControl
                valuePath="forecast.seasonal"
                checked={forecastSeasonal}
                labelText={messages["forecastSeasonal"].id}
                disabled={forecastControlsDisabled}
                properties={properties}
                pushData={pushData}
            />

            {Boolean(slicedForecast) && (
                <Message type="progress" className="adi-input-progress gd-slicedForecast-message">
                    <FormattedMessage id={messages["forecastSlicedWarningTitle"].id} tagName="strong" />
                    <FormattedMessage id={messages["forecastSlicedWarningDescription"].id} tagName="div" />
                </Message>
            )}
        </ConfigSection>
    );
});

export default ForecastSection;
