// (C) 2019-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";
import { type ChartCellVerticalAlign } from "@gooddata/sdk-ui-charts";

import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { verticalAlignmentDropdownItems } from "../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IVerticalAlignControlProps {
    pushData: (data: IPushData) => any;
    properties: IVisualizationProperties;
    defaultValue?: ChartCellVerticalAlign;
}

export function VerticalAlignControl({
    pushData,
    properties,
    defaultValue = "top",
}: IVerticalAlignControlProps) {
    const intl = useIntl();
    const rowSizing = properties?.controls?.["cellVerticalAlign"] ?? defaultValue;

    return (
        <div className="s-vertical-align-config">
            <DropdownControl
                value={rowSizing}
                valuePath="cellVerticalAlign"
                labelText={messages["verticalAlign"].id}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(verticalAlignmentDropdownItems, intl)}
            />
        </div>
    );
}
