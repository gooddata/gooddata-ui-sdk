// (C) 2025-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { type IInsightDefinition, bucketIsEmpty, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import type { GeoTileset } from "@gooddata/sdk-ui-geo";

import {
    ConfigurationPanelContent,
    type IConfigurationPanelContentProps,
} from "./ConfigurationPanelContent.js";
import { messages } from "../../../locales.js";
import { isGeoBasemapConfigEnabled, isGeoChartsViewportConfigEnabled } from "../../constants/featureFlags.js";
import { BasemapDropdownControl } from "../configurationControls/BasemapDropdownControl.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { GeoViewportControl, type ICurrentMapView } from "../configurationControls/GeoViewportControl.js";

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
    protected getControlProperties(): { tileset: GeoTileset } {
        const tileset = (this.props.properties?.controls?.["tileset"] as GeoTileset | undefined) ?? "default";
        return {
            tileset,
        };
    }

    protected renderViewportSection(): ReactElement {
        const { properties, propertiesMeta, pushData, featureFlags } = this.props;
        const { tileset } = this.getControlProperties();
        const isBasemapConfigEnabled = isGeoBasemapConfigEnabled(featureFlags);
        const isViewportConfigEnabled = isGeoChartsViewportConfigEnabled(featureFlags);
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
                    disabled={this.isControlDisabled()}
                    pushData={pushData}
                    getCurrentMapView={isViewportConfigEnabled ? this.props.getCurrentMapView : undefined}
                    beforeNavigationContent={
                        isBasemapConfigEnabled ? (
                            <BasemapDropdownControl
                                valuePath="tileset"
                                labelText={messages["basemapTitle"].id}
                                properties={properties}
                                value={tileset}
                                disabled={this.isControlDisabled()}
                                showDisabledMessage={this.isControlDisabled()}
                                pushData={pushData}
                            />
                        ) : null
                    }
                />
            </ConfigSection>
        );
    }

    protected renderConfigurationPanel(): ReactNode {
        return (
            <div>
                {/* Legend Configuration */}
                {this.renderLegendSection()}

                {/* Color Configuration */}
                {this.renderColorSection()}

                {/* Viewport Configuration */}
                {this.renderViewportSection()}

                {/* Canvas Configuration */}
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
                hasMeasures // color configuration is category-driven
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

function hasAreaAttribute(insight?: IInsightDefinition): boolean {
    if (!insight) {
        return false;
    }

    const bucket = insightBucket(insight, BucketNames.AREA);
    return bucket !== undefined && !bucketIsEmpty(bucket);
}
