// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useCallback, useMemo } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";
import { type IGeoChartViewport, type IGeoLngLat } from "@gooddata/sdk-ui-geo";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { CheckboxControl } from "./CheckboxControl.js";
import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { pushpinViewportDropdownItems } from "../../constants/dropdowns.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";

export interface ICurrentMapView {
    center?: IGeoLngLat;
    zoom?: number;
}

export interface IGeoViewportControl {
    disabled: boolean;
    properties?: IVisualizationProperties;
    pushData?: (data: IPushData) => void;
    getCurrentMapView?: () => ICurrentMapView;
    beforeNavigationContent?: ReactNode;
    className?: string;
}

function getViewportProperty(props: IGeoViewportControl): IGeoChartViewport {
    const viewport = props.properties?.controls?.["viewport"];
    return {
        ...viewport,
        area: viewport?.area ?? "auto",
    };
}

const TOOLTIP_ALIGN_POINTS = [{ align: "cr cl", offset: { x: 5, y: 0 } }];

/**
 * Generic viewport control for geo charts (pushpin and area).
 * Allows users to select a default viewport and configure navigation interactions.
 *
 * @internal
 */
export function GeoViewportControl(props: IGeoViewportControl): ReactElement {
    const intl = useIntl();
    const { area, navigation } = getViewportProperty(props);
    const isPanEnabled = navigation?.pan ?? true;
    const isZoomEnabled = navigation?.zoom ?? true;
    const {
        disabled,
        properties,
        pushData,
        getCurrentMapView,
        beforeNavigationContent,
        className = "s-geo-viewport-control",
    } = props;
    const isAdvancedViewportConfigEnabled = Boolean(getCurrentMapView);
    const effectiveArea = !isAdvancedViewportConfigEnabled && area === "custom" ? "auto" : area;
    const shouldRenderNavigationControls = isAdvancedViewportConfigEnabled;

    const handleViewportPushData = useCallback(
        (data: IPushData): void => {
            const nextProperties = cloneDeep(data.properties ?? properties);
            if (!nextProperties) {
                pushData?.(data);
                return;
            }
            const selectedArea = nextProperties?.controls?.["viewport"]?.area;
            if (selectedArea === "custom") {
                const currentMapView = getCurrentMapView?.();
                const hasValidSnapshot =
                    Boolean(currentMapView?.center) && typeof currentMapView?.zoom === "number";

                if (hasValidSnapshot && currentMapView?.center) {
                    set(nextProperties, "controls.center", currentMapView.center);
                    set(nextProperties, "controls.zoom", currentMapView.zoom);
                }
            } else {
                set(nextProperties, "controls.center", undefined);
                set(nextProperties, "controls.zoom", undefined);
            }

            pushData?.({
                ...data,
                properties: nextProperties,
            });
        },
        [getCurrentMapView, properties, pushData],
    );

    const viewportItems = useMemo(() => {
        if (isAdvancedViewportConfigEnabled) {
            return pushpinViewportDropdownItems;
        }

        return pushpinViewportDropdownItems.filter((item) => item.value !== "custom");
    }, [isAdvancedViewportConfigEnabled]);

    const translatedViewportItems = useMemo(
        () => getTranslatedDropdownItems(viewportItems, intl),
        [viewportItems, intl],
    );

    return (
        <div className={`gd-geo-viewport-control ${className}`}>
            <DropdownControl
                value={effectiveArea}
                valuePath="viewport.area"
                labelText={messages["viewportAreaTitle"].id}
                disabled={disabled}
                showDisabledMessage={disabled}
                properties={properties}
                pushData={handleViewportPushData}
                items={translatedViewportItems}
            />
            {beforeNavigationContent}
            {shouldRenderNavigationControls ? (
                <div className="gd-geo-viewport-control__navigation">
                    <div className="gd-geo-viewport-control__navigation-title">
                        <span className="input-label-text">
                            {intl.formatMessage({ id: messages["viewportNavigationTitle"].id })}
                        </span>
                        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                            <span className="gd-interactions-section__question-mark gd-icon-circle-question" />
                            <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                                {intl.formatMessage({ id: messages["viewportNavigationTooltip"].id })}
                            </Bubble>
                        </BubbleHoverTrigger>
                        <span className="gd-geo-viewport-control__navigation-line" />
                    </div>
                    <div className="gd-geo-viewport-control__navigation-options">
                        <CheckboxControl
                            valuePath="viewport.navigation.pan"
                            labelText={messages["viewportNavigationPan"].id}
                            properties={properties}
                            checked={isPanEnabled}
                            disabled={disabled}
                            showDisabledMessage={disabled}
                            pushData={pushData}
                            defaultValue
                        />
                        <CheckboxControl
                            valuePath="viewport.navigation.zoom"
                            labelText={messages["viewportNavigationZoom"].id}
                            properties={properties}
                            checked={isZoomEnabled}
                            disabled={disabled}
                            showDisabledMessage={disabled}
                            pushData={pushData}
                            defaultValue
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
