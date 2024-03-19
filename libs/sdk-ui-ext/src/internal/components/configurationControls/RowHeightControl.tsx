// (C) 2019-2024 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { ChartRowHeight } from "@gooddata/sdk-ui-charts";
import DropdownControl from "./DropdownControl.js";
import { IPushData } from "@gooddata/sdk-ui";

import { rowSizingDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";

export interface IRowHeightControlProps {
    pushData: (data: IPushData) => any;
    properties: IVisualizationProperties;
    defaultValue?: ChartRowHeight;
}

export const RowHeightControl = ({
    pushData,
    properties,
    defaultValue = "small",
}: IRowHeightControlProps) => {
    const intl = useIntl();
    const rowSizing = properties?.controls?.rowHeight ?? defaultValue;

    return (
        <div className="s-row-height-config">
            <DropdownControl
                value={rowSizing}
                valuePath="rowHeight"
                labelText={messages.rowHeight.id}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(rowSizingDropdownItems, intl)}
            />
        </div>
    );
};
