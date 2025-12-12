// (C) 2019-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";
import { type ChartRowHeight } from "@gooddata/sdk-ui-charts";

import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { rowSizingDropdownItems } from "../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IRowHeightControlProps {
    pushData: (data: IPushData) => any;
    properties: IVisualizationProperties;
    defaultValue?: ChartRowHeight;
}

export function RowHeightControl({ pushData, properties, defaultValue = "small" }: IRowHeightControlProps) {
    const intl = useIntl();
    const rowSizing = properties?.controls?.["rowHeight"] ?? defaultValue;

    return (
        <div className="s-row-height-config">
            <DropdownControl
                value={rowSizing}
                valuePath="rowHeight"
                labelText={messages["rowHeight"].id}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(rowSizingDropdownItems, intl)}
            />
        </div>
    );
}
