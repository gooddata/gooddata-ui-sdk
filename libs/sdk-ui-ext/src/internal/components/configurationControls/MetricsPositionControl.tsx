// (C) 2019-2025 GoodData Corporation
import { useIntl } from "react-intl";
import DropdownControl from "./DropdownControl.js";

import { metricsPositionDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";
import ConfigSubsection from "./ConfigSubsection.js";

export interface IMetricsPositionControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string;
}

export default function MetricsPositionControl({
    pushData,
    properties,
    isDisabled,
    showDisabledMessage = false,
    defaultValue = "columns",
}: IMetricsPositionControlProps) {
    const intl = useIntl();

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
