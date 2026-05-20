// (C) 2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";

import { messages } from "../../../locales.js";
import { radarGridLineShapeDropdownItems } from "../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

import { DropdownControl } from "./DropdownControl.js";

export interface IRadarGridLineShapeControlProps {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: IPushData) => void;
}

export const RadarGridLineShapeControl = memo(function RadarGridLineShapeControl({
    disabled,
    properties,
    pushData,
}: IRadarGridLineShapeControlProps) {
    const intl = useIntl();
    const value = properties?.controls?.["radarGridLineShape"] ?? "polygon";

    return (
        <DropdownControl
            value={value}
            valuePath="radarGridLineShape"
            labelText={messages["radarGridLineShapeLabel"].id}
            disabled={disabled}
            properties={properties}
            pushData={pushData}
            items={getTranslatedDropdownItems(radarGridLineShapeDropdownItems, intl)}
        />
    );
});
