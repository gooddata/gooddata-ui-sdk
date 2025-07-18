// (C) 2019-2025 GoodData Corporation
import { useIntl } from "react-intl";
import { IInsightDefinition } from "@gooddata/sdk-model";

import DropdownControl from "./DropdownControl.js";

import { columnHeadersPositionDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";
import ConfigSubsection from "./ConfigSubsection.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../utils/controlsHelper.js";

export interface IColumnHeadersPositionControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    insight: IInsightDefinition;
    defaultValue?: string;
}

export default function ColumnHeadersPositionControl({
    pushData,
    properties,
    isDisabled,
    defaultValue = "top",
    insight,
}: IColumnHeadersPositionControlProps) {
    const intl = useIntl();

    const columnHeadersPosition = isSetColumnHeadersPositionToLeftAllowed(insight)
        ? (properties?.controls?.columnHeadersPosition ?? defaultValue)
        : defaultValue;

    return (
        <ConfigSubsection title={messages.columnHeaderPositionTitle.id}>
            <DropdownControl
                value={columnHeadersPosition}
                valuePath="columnHeadersPosition"
                labelText={messages.columnHeaderPositionLabel.id}
                disabled={isDisabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(columnHeadersPositionDropdownItems, intl)}
                showDisabledMessage={isDisabled}
            />
        </ConfigSubsection>
    );
}
