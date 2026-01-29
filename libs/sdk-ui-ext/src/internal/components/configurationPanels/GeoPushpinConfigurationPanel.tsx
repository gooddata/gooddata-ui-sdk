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
import type { GeoTileset } from "@gooddata/sdk-ui-geo";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ConfigurationPanelContent } from "./ConfigurationPanelContent.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { CheckboxControl } from "../configurationControls/CheckboxControl.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { DropdownControl } from "../configurationControls/DropdownControl.js";
import { LegendSection } from "../configurationControls/legend/LegendSection.js";
import { PushpinSizeControl } from "../configurationControls/PushpinSizeControl.js";
import { PushpinViewportControl } from "../configurationControls/PushpinViewportControl.js";

export class GeoPushpinConfigurationPanel extends ConfigurationPanelContent {
    protected getControlProperties(): { groupNearbyPoints: boolean; tileset: GeoTileset } {
        const groupNearbyPoints = this.props.properties?.controls?.["points"]?.groupNearbyPoints ?? true;
        const tileset = (this.props.properties?.controls?.["tileset"] as GeoTileset | undefined) ?? "default";
        return {
            groupNearbyPoints,
            tileset,
        };
    }

    protected override renderLegendSection(): ReactNode {
        const { insight, properties, propertiesMeta, pushData } = this.props;

        const isLegendVisible =
            hasSegmentAttribute(insight) || hasColorMeasure(insight) || hasSizeMeasure(insight);
        const controlsDisabled = this.isControlDisabled() || !isLegendVisible;

        return (
            <LegendSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
            />
        );
    }

    protected renderViewportSection(): ReactElement {
        const { properties, propertiesMeta, pushData, featureFlags } = this.props;
        const { tileset } = this.getControlProperties();
        const isControlDisabled = this.isControlDisabled();
        const isBasemapConfigEnabled = !!featureFlags?.["enableGeoBasemapConfig"];
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
                />
                {isBasemapConfigEnabled ? (
                    <DropdownControl
                        valuePath="tileset"
                        labelText={messages["basemapTitle"].id}
                        properties={properties}
                        value={tileset}
                        items={[
                            { title: "Default", value: "default" },
                            { title: "Satellite", value: "satellite" },
                        ]}
                        disabled={isControlDisabled}
                        showDisabledMessage={isControlDisabled}
                        pushData={pushData}
                    />
                ) : null}
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

function hasColorMeasure(insight: IInsightDefinition | undefined): boolean {
    if (!insight) {
        return false;
    }
    const bucket = insightBucket(insight, BucketNames.COLOR);

    return bucket !== undefined && !bucketIsEmpty(bucket);
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

function hasSegmentAttribute(insight: IInsightDefinition | undefined): boolean {
    if (!insight) {
        return false;
    }
    const bucket = insightBucket(insight, BucketNames.SEGMENT);

    return bucket !== undefined && !bucketIsEmpty(bucket);
}
