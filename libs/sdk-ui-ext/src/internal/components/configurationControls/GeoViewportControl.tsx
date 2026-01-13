// (C) 2025-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { type IGeoConfigViewport } from "@gooddata/sdk-ui-geo";

import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { pushpinViewportDropdownItems } from "../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface IGeoViewportControl {
    disabled: boolean;
    properties?: IVisualizationProperties;
    pushData?: (data: any) => any;
    className?: string;
}

function getViewportProperty(props: IGeoViewportControl): IGeoConfigViewport {
    return props.properties?.controls?.["viewport"] ?? { area: "auto" };
}

/**
 * Generic viewport control for geo charts (pushpin and area).
 * Allows users to select a default viewport preset (auto, world, or continent).
 *
 * @internal
 */
export function GeoViewportControl(props: IGeoViewportControl): ReactElement {
    const intl = useIntl();
    const { area } = getViewportProperty(props);
    const { disabled, properties, pushData, className = "s-geo-viewport-control" } = props;
    return (
        <div className={className}>
            <DropdownControl
                value={area}
                valuePath="viewport.area"
                labelText={messages["viewportAreaTitle"].id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(pushpinViewportDropdownItems, intl)}
            />
        </div>
    );
}
