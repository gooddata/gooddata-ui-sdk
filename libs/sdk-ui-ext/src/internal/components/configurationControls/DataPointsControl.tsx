// (C) 2020-2025 GoodData Corporation
import { useIntl } from "react-intl";
import DropdownControl from "./DropdownControl.js";

import { dataPointsDropdownLabels } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";

export interface IDataPointsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string | boolean;
}

export default function DataPointsControl({
    pushData,
    properties,
    isDisabled,
    showDisabledMessage = false,
    defaultValue = "auto",
}: IDataPointsControlProps) {
    const intl = useIntl();

    const dataPoints = properties?.controls?.dataPoints?.visible ?? defaultValue;

    return (
        <div className="s-data-points-config">
            <DropdownControl
                value={dataPoints}
                valuePath="dataPoints.visible"
                labelText={messages.dataPoints.id}
                disabled={isDisabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(dataPointsDropdownLabels, intl)}
                showDisabledMessage={showDisabledMessage}
            />
        </div>
    );
}
