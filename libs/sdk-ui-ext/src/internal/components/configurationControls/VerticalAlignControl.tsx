// (C) 2019-2024 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { IPushData } from "@gooddata/sdk-ui";
import { ChartCellVerticalAlign } from "@gooddata/sdk-ui-charts";
import DropdownControl from "./DropdownControl.js";

import { verticalAlignmentDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";

export interface IVerticalAlignControlProps {
    pushData: (data: IPushData) => any;
    properties: IVisualizationProperties;
    defaultValue?: ChartCellVerticalAlign;
}

export const VerticalAlignControl = ({
    pushData,
    properties,
    defaultValue = "top",
}: IVerticalAlignControlProps) => {
    const intl = useIntl();
    const rowSizing = properties?.controls?.cellVerticalAlign ?? defaultValue;

    return (
        <div className="s-vertical-align-config">
            <DropdownControl
                value={rowSizing}
                valuePath="cellVerticalAlign"
                labelText={messages.verticalAlign.id}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(verticalAlignmentDropdownItems, intl)}
            />
        </div>
    );
};
