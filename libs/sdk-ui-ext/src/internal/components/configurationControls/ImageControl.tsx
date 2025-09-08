// (C) 2019-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { IPushData } from "@gooddata/sdk-ui";
import { ChartCellImageSizing } from "@gooddata/sdk-ui-charts";

import DropdownControl from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { imageDropdownItems } from "../../constants/dropdowns.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IImageControlProps {
    pushData: (data: IPushData) => any;
    properties: IVisualizationProperties;
    defaultValue?: ChartCellImageSizing;
}

export function ImageControl({ pushData, properties, defaultValue = "fit" }: IImageControlProps) {
    const intl = useIntl();
    const rowSizing = properties?.controls?.["cellImageSizing"] ?? defaultValue;

    return (
        <div className="s-image-config">
            <DropdownControl
                value={rowSizing}
                valuePath="cellImageSizing"
                labelText={messages["image"].id}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(imageDropdownItems, intl)}
            />
        </div>
    );
}
