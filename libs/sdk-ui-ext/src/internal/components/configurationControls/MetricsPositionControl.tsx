// (C) 2019-2025 GoodData Corporation
import React from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import ConfigSubsection from "./ConfigSubsection.js";
import DropdownControl from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { metricsPositionDropdownItems } from "../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IMetricsPositionControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string;
}

class MetricsPositionControl extends React.Component<IMetricsPositionControlProps & WrappedComponentProps> {
    public static defaultProps = {
        defaultValue: "columns",
        showDisabledMessage: false,
    };
    public render() {
        const { pushData, properties, intl, isDisabled, showDisabledMessage, defaultValue } = this.props;
        const metricsPosition = properties?.controls?.measureGroupDimension ?? defaultValue;

        return (
            <ConfigSubsection title={messages.metricsPositionTitle.id}>
                <DropdownControl
                    value={metricsPosition}
                    valuePath="measureGroupDimension"
                    labelText={messages.metricsPositionLabel.id}
                    disabled={isDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(metricsPositionDropdownItems, intl)}
                    showDisabledMessage={showDisabledMessage}
                />
            </ConfigSubsection>
        );
    }
}

export default injectIntl(MetricsPositionControl);
