// (C) 2025-2026 GoodData Corporation

import { memo, useMemo } from "react";

import { useIntl } from "react-intl";

import { normalizeGeoLegendPosition } from "@gooddata/sdk-ui-geo/internal";

import { messages } from "../../../../locales.js";
import { type IDropdownItem } from "../../../interfaces/Dropdown.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslation } from "../../../utils/translations.js";
import { DropdownControl } from "../DropdownControl.js";

interface IGeoLegendPushData {
    properties?: IVisualizationProperties;
    propertiesMeta?: Record<string, { collapsed: boolean }>;
}

export interface IGeoLegendPositionControlProps {
    disabled: boolean;
    value: string;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: IGeoLegendPushData) => void;
}

export const GeoLegendPositionControl = memo(function GeoLegendPositionControl({
    disabled,
    value,
    showDisabledMessage,
    properties,
    pushData,
}: IGeoLegendPositionControlProps) {
    const intl = useIntl();

    const items = useMemo<IDropdownItem[]>(() => {
        const top = getTranslation(messages["positionUp"].id, intl);
        const bottom = getTranslation(messages["positionDown"].id, intl);
        const left = getTranslation(messages["positionLeft"].id, intl);
        const right = getTranslation(messages["positionRight"].id, intl);

        return [
            { title: getTranslation(messages["autoDefault"].id, intl), value: "auto" },
            { type: "separator" },
            { title: `${top} ${left}`, value: "top-left", icon: "gd-dropdown-icon-legend-top-left" },
            { title: `${top} ${right}`, value: "top-right", icon: "gd-dropdown-icon-legend-top-right" },
            {
                title: `${bottom} ${left}`,
                value: "bottom-left",
                icon: "gd-dropdown-icon-legend-bottom-left",
            },
            {
                title: `${bottom} ${right}`,
                value: "bottom-right",
                icon: "gd-dropdown-icon-legend-bottom-right",
            },
        ];
    }, [intl]);

    return (
        <DropdownControl
            value={normalizeGeoLegendPosition(value)}
            valuePath="legend.position"
            labelText={messages["position"].id}
            disabled={disabled}
            properties={properties}
            pushData={pushData}
            items={items}
            showDisabledMessage={showDisabledMessage}
        />
    );
});
