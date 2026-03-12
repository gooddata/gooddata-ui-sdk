// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { type IInsightDefinition, bucketIsEmpty, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type GeoBasemap, type GeoColorScheme, doesGeoBasemapSupportColorScheme } from "@gooddata/sdk-ui-geo";

import {
    ConfigurationPanelContent,
    type IConfigurationPanelContentProps,
} from "./ConfigurationPanelContent.js";
import { hasColorMeasure, hasSegmentAttribute } from "./geoInsightBucketUtils.js";
import { messages } from "../../../locales.js";
import {
    isGeoBasemapConfigEnabled,
    isGeoChartsViewportConfigEnabled,
    isGeoSatelliteBasemapEnabled,
} from "../../constants/featureFlags.js";
import { sanitizeGeoMapStyleOptions } from "../../constants/geoMapStyle.js";
import { BasemapDropdownControl } from "../configurationControls/BasemapDropdownControl.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";
import { ColorSchemeDropdownControl } from "../configurationControls/ColorSchemeDropdownControl.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { GeoViewportControl, type ICurrentMapView } from "../configurationControls/GeoViewportControl.js";
import { GeoLegendSection } from "../configurationControls/legend/GeoLegendSection.js";

interface IGeoAreaConfigurationPanelProps extends IConfigurationPanelContentProps {
    getCurrentMapView?: () => ICurrentMapView;
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
        basemap: GeoBasemap | undefined;
        colorScheme: GeoColorScheme | undefined;
    } {
        return sanitizeGeoMapStyleOptions({
            basemap: this.props.properties?.controls?.["basemap"],
            legacyTileset: this.props.properties?.controls?.["tileset"],
            colorScheme: this.props.properties?.controls?.["colorScheme"],
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
        const { properties, propertiesMeta, pushData, featureFlags } = this.props;
        const { basemap, colorScheme } = this.getControlProperties();
        const isBasemapConfigEnabled = isGeoBasemapConfigEnabled(featureFlags);
        const isSatelliteBasemapEnabled = isGeoSatelliteBasemapEnabled(featureFlags);
        const isViewportConfigEnabled = isGeoChartsViewportConfigEnabled(featureFlags);
        const isDisabled = this.isControlDisabled();
        const isColorSchemeSupported = basemap !== undefined && doesGeoBasemapSupportColorScheme(basemap);
        const isColorSchemeDisabled = isDisabled || !isColorSchemeSupported;
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
                        isBasemapConfigEnabled ? (
                            <>
                                <BasemapDropdownControl
                                    valuePath="basemap"
                                    labelText={messages["basemapTitle"].id}
                                    properties={properties}
                                    value={basemap}
                                    disabled={isDisabled}
                                    showDisabledMessage={isDisabled}
                                    showSatelliteBasemapOption={isSatelliteBasemapEnabled}
                                    pushData={pushData}
                                />
                                <ColorSchemeDropdownControl
                                    valuePath="colorScheme"
                                    labelText={messages["colorSchemeTitle"].id}
                                    properties={properties}
                                    value={colorScheme}
                                    disabled={isColorSchemeDisabled}
                                    showDisabledMessage={isColorSchemeDisabled}
                                    pushData={pushData}
                                />
                            </>
                        ) : null
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
