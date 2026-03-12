// (C) 2020-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import {
    type IInsightDefinition,
    bucketIsEmpty,
    insightBucket,
    insightHasMeasures,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { type GeoBasemap, type GeoColorScheme, doesGeoBasemapSupportColorScheme } from "@gooddata/sdk-ui-geo";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    ConfigurationPanelContent,
    type IConfigurationPanelContentProps,
} from "./ConfigurationPanelContent.js";
import { hasColorMeasure, hasSegmentAttribute } from "./geoInsightBucketUtils.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import {
    isGeoBasemapConfigEnabled,
    isGeoChartsViewportConfigEnabled,
    isGeoSatelliteBasemapEnabled,
} from "../../constants/featureFlags.js";
import { sanitizeGeoMapStyleOptions } from "../../constants/geoMapStyle.js";
import { BasemapDropdownControl } from "../configurationControls/BasemapDropdownControl.js";
import { CheckboxControl } from "../configurationControls/CheckboxControl.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";
import { ColorSchemeDropdownControl } from "../configurationControls/ColorSchemeDropdownControl.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { type ICurrentMapView } from "../configurationControls/GeoViewportControl.js";
import { GeoLegendSection } from "../configurationControls/legend/GeoLegendSection.js";
import { PushpinSizeControl } from "../configurationControls/PushpinSizeControl.js";
import { PushpinViewportControl } from "../configurationControls/PushpinViewportControl.js";

interface IGeoPushpinConfigurationPanelProps extends IConfigurationPanelContentProps {
    getCurrentMapView?: () => ICurrentMapView;
}

export class GeoPushpinConfigurationPanel extends ConfigurationPanelContent<IGeoPushpinConfigurationPanelProps> {
    protected getControlProperties(): {
        groupNearbyPoints: boolean;
        basemap: GeoBasemap | undefined;
        colorScheme: GeoColorScheme | undefined;
    } {
        const groupNearbyPoints = this.props.properties?.controls?.["points"]?.groupNearbyPoints ?? true;
        const { basemap, colorScheme } = sanitizeGeoMapStyleOptions({
            basemap: this.props.properties?.controls?.["basemap"],
            legacyTileset: this.props.properties?.controls?.["tileset"],
            colorScheme: this.props.properties?.controls?.["colorScheme"],
        });
        return {
            groupNearbyPoints,
            basemap,
            colorScheme,
        };
    }

    protected override renderLegendSection(): ReactNode {
        const { insight, properties, propertiesMeta, pushData } = this.props;
        const isAttributeOnlyLegend =
            hasLocationAttribute(insight) &&
            !hasSegmentAttribute(insight) &&
            !hasColorMeasure(insight) &&
            !hasSizeMeasure(insight);
        const isLegendVisible =
            hasSegmentAttribute(insight) || hasColorMeasure(insight) || hasSizeMeasure(insight);
        const controlsDisabled = this.isControlDisabled() || !isLegendVisible;

        const legendSectionProps = {
            properties,
            propertiesMeta,
            controlsDisabled,
            defaultLegendEnabled: !isAttributeOnlyLegend,
            pushData,
        };

        return <GeoLegendSection {...legendSectionProps} />;
    }

    protected renderViewportSection(): ReactElement {
        const { properties, propertiesMeta, pushData, featureFlags } = this.props;
        const { basemap, colorScheme } = this.getControlProperties();
        const isControlDisabled = this.isControlDisabled();
        const isBasemapConfigEnabled = isGeoBasemapConfigEnabled(featureFlags);
        const isSatelliteBasemapEnabled = isGeoSatelliteBasemapEnabled(featureFlags);
        const isViewportConfigEnabled = isGeoChartsViewportConfigEnabled(featureFlags);
        const isColorSchemeSupported = basemap !== undefined && doesGeoBasemapSupportColorScheme(basemap);
        const isColorSchemeDisabled = isControlDisabled || !isColorSchemeSupported;
        return (
            <ConfigSection
                id="map_section"
                title={messages["pointsMapTitle"].id}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <PushpinViewportControl
                    properties={properties}
                    disabled={isControlDisabled}
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
                                    disabled={isControlDisabled}
                                    showDisabledMessage={isControlDisabled}
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

    protected renderPointsSection(): ReactElement {
        const { groupNearbyPoints } = this.getControlProperties();

        const { properties, propertiesMeta, pushData, insight } = this.props;
        const isControlDisabled = this.isControlDisabled();
        const isClusteringDisabled =
            isControlDisabled || insightHasMeasures(insight!) || hasSegmentAttribute(insight);
        const isPushpinSizeControlDisabled = isControlDisabled || !hasSizeMeasure(insight);
        return (
            <ConfigSection
                id="points_section"
                title={messages["pointsTitle"].id}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <CheckboxControl
                    valuePath="points.groupNearbyPoints"
                    labelText={messages["pointsGroupNearbyPoints"].id}
                    properties={properties}
                    checked={groupNearbyPoints}
                    disabled={isClusteringDisabled}
                    showDisabledMessage={isClusteringDisabled}
                    pushData={pushData}
                />
                <PushpinSizeControl
                    properties={properties!}
                    disabled={isPushpinSizeControlDisabled}
                    pushData={pushData!}
                />
            </ConfigSection>
        );
    }

    protected override isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        return !!(!hasLocationAttribute(insight) || isError || isLoading);
    }

    protected getBubbleClassNames(): string {
        return cx("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    protected renderConfigurationPanel(): ReactNode {
        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.renderLegendSection()}
                    {this.renderViewportSection()}
                    {this.renderPointsSection()}
                </div>
                <Bubble
                    className={this.getBubbleClassNames()}
                    arrowOffsets={{ "tc bc": [BUBBLE_ARROW_OFFSET_X, BUBBLE_ARROW_OFFSET_Y] }}
                    alignPoints={[{ align: "tc bc" }]}
                >
                    <FormattedMessage id="properties.config.not_applicable" />
                </Bubble>
            </BubbleHoverTrigger>
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
                hasMeasures // hasMeasures is true because Color Config is based on Attribute
                isLoading={isLoading}
                supportsChartFill={false}
            />
        );
    }
}

function hasSizeMeasure(insight: IInsightDefinition | undefined): boolean {
    if (!insight) {
        return false;
    }
    const bucket = insightBucket(insight, BucketNames.SIZE);

    return bucket !== undefined && !bucketIsEmpty(bucket);
}

function hasLocationAttribute(insight: IInsightDefinition | undefined): boolean {
    if (!insight) {
        return false;
    }
    const bucket = insightBucket(insight, BucketNames.LOCATION);

    return bucket !== undefined && !bucketIsEmpty(bucket);
}
