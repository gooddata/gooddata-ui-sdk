// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { type IInsightDefinition, bucketIsEmpty, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import {
    ConfigurationPanelContent,
    type IConfigurationPanelContentProps,
} from "./ConfigurationPanelContent.js";
import { hasColorMeasure, hasSegmentAttribute } from "./geoInsightBucketUtils.js";
import { messages } from "../../../locales.js";
import { isGeoBasemapConfigEnabled, isGeoChartsViewportConfigEnabled } from "../../constants/featureFlags.js";
import { sanitizeGeoMapStyleOptions } from "../../constants/geoMapStyle.js";
import { type IDropdownItem } from "../../interfaces/Dropdown.js";
import { BasemapDropdownControl } from "../configurationControls/BasemapDropdownControl.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { GeoViewportControl, type ICurrentMapView } from "../configurationControls/GeoViewportControl.js";
import { GeoLegendSection } from "../configurationControls/legend/GeoLegendSection.js";

interface IGeoAreaConfigurationPanelProps extends IConfigurationPanelContentProps {
    getCurrentMapView?: () => ICurrentMapView;
    basemapItems: IDropdownItem[];
}

/**
 * Configuration panel for GeoAreaChart
 *
 * @remarks
 * This panel provides configuration options specific to geo area maps:
 * - Legend settings
 * - Area styling (fill opacity, border color, border width)
 * - Viewport configuration
 * - Color mapping
 *
 * @internal
 */
export class GeoAreaConfigurationPanel extends ConfigurationPanelContent<IGeoAreaConfigurationPanelProps> {
    protected getControlProperties(): {
        basemap: string | undefined;
    } {
        return sanitizeGeoMapStyleOptions({
            basemap: this.props.properties?.controls?.["basemap"],
            legacyTileset: this.props.properties?.controls?.["tileset"],
        });
    }

    protected override renderLegendSection(): ReactNode {
        const { insight, properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();
        const isAttributeOnlyLegend =
            hasAreaAttribute(insight) && !hasSegmentAttribute(insight) && !hasColorMeasure(insight);

        return (
            <GeoLegendSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                controlsDisabled={controlsDisabled}
                defaultLegendEnabled={!isAttributeOnlyLegend}
                pushData={pushData}
            />
        );
    }

    protected renderViewportSection(): ReactElement {
        const { properties, propertiesMeta, pushData, featureFlags, basemapItems } = this.props;
        const { basemap } = this.getControlProperties();
        const isBasemapConfigEnabled = isGeoBasemapConfigEnabled(featureFlags);
        const isViewportConfigEnabled = isGeoChartsViewportConfigEnabled(featureFlags);
        const isDisabled = this.isControlDisabled();
        return (
            <ConfigSection
                id="map_section"
                title={messages["pointsMapTitle"].id}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <GeoViewportControl
                    properties={properties}
                    disabled={isDisabled}
                    pushData={pushData}
                    getCurrentMapView={isViewportConfigEnabled ? this.props.getCurrentMapView : undefined}
                    beforeNavigationContent={
                        <BasemapDropdownControl
                            enabled={isBasemapConfigEnabled}
                            items={basemapItems}
                            value={basemap}
                            disabled={isDisabled}
                            showDisabledMessage={isDisabled}
                            properties={properties}
                            pushData={pushData}
                        />
                    }
                />
            </ConfigSection>
        );
    }

    protected renderConfigurationPanel(): ReactNode {
        return (
            <div>
                {this.renderLegendSection()}
                {this.renderColorSection()}
                {this.renderViewportSection()}
                {this.renderInteractionsSection()}
            </div>
        );
    }

    protected override renderColorSection(): ReactNode {
        const { properties, propertiesMeta, pushData, colors, references, isLoading } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures // hasMeasures is true because color config is attribute-based
                isLoading={isLoading}
                supportsChartFill={false}
            />
        );
    }

    protected override isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        return !!(!hasAreaAttribute(insight) || isError || isLoading);
    }
}

function hasAreaAttribute(insight: IInsightDefinition | undefined): boolean {
    if (!insight) {
        return false;
    }

    const bucket = insightBucket(insight, BucketNames.AREA);
    return bucket !== undefined && !bucketIsEmpty(bucket);
}
