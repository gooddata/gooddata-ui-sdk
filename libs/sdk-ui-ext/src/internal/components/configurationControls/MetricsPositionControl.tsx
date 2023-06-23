// (C) 2019-2023 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import DropdownControl from "./DropdownControl";

import { metricsPositionDropdownItems } from "../../constants/dropdowns";
import { getTranslatedDropdownItems } from "../../utils/translations";
import { IVisualizationProperties } from "../../interfaces/Visualization";
import { messages } from "../../../locales";
import ConfigSubsection from "./ConfigSubsection";
import {ConfigDummySection} from "./ConfigDummySection";

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
        const {
            pushData,
            properties,
            intl,
            isDisabled,
            showDisabledMessage,
            defaultValue,
        } = this.props;
        const metricsPosition = properties?.controls?.measureGroupDimension ?? defaultValue;

        return (
            <ConfigDummySection>
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
            </ConfigDummySection>
        );
    }
}

export default injectIntl(MetricsPositionControl);
