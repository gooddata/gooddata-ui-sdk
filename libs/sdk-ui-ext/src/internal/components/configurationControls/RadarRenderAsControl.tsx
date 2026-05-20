// (C) 2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";

import { messages } from "../../../locales.js";
import { radarRenderAsDropdownItems } from "../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

import { DropdownControl } from "./DropdownControl.js";

export interface IRadarRenderAsControlProps {
    disabled: boolean;
    properties: IVisualizationProperties;
    pushData: (data: IPushData) => void;
}

export const RadarRenderAsControl = memo(function RadarRenderAsControl({
    disabled,
    properties,
    pushData,
}: IRadarRenderAsControlProps) {
    const intl = useIntl();
    const value = properties?.controls?.["radarRenderAs"] ?? "filled";

    return (
        <DropdownControl
            value={value}
            valuePath="radarRenderAs"
            labelText={messages["radarRenderAsLabel"].id}
            disabled={disabled}
            properties={properties}
            pushData={pushData}
            items={getTranslatedDropdownItems(radarRenderAsDropdownItems, intl)}
        />
    );
});
