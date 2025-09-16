// (C) 2019-2025 GoodData Corporation

import { WrappedComponentProps, injectIntl } from "react-intl";

import { IInsightDefinition } from "@gooddata/sdk-model";

import ConfigSubsection from "./ConfigSubsection.js";
import DropdownControl from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { columnHeadersPositionDropdownItems } from "../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../utils/controlsHelper.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IColumnHeadersPositionControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    insight: IInsightDefinition;
    showDisabledMessage?: boolean;
    defaultValue?: string;
}

function ColumnHeadersPositionControl({
    pushData,
    properties,
    intl,
    isDisabled,
    defaultValue = "top",
    insight,
}: IColumnHeadersPositionControlProps & WrappedComponentProps) {
    const columnHeadersPosition = isSetColumnHeadersPositionToLeftAllowed(insight)
        ? (properties?.controls?.["columnHeadersPosition"] ?? defaultValue)
        : defaultValue;

    return (
        <ConfigSubsection title={messages["columnHeaderPositionTitle"].id}>
            <DropdownControl
                value={columnHeadersPosition}
                valuePath="columnHeadersPosition"
                labelText={messages["columnHeaderPositionLabel"].id}
                disabled={isDisabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(columnHeadersPositionDropdownItems, intl)}
                showDisabledMessage={isDisabled}
            />
        </ConfigSubsection>
    );
}

export default injectIntl(ColumnHeadersPositionControl);
