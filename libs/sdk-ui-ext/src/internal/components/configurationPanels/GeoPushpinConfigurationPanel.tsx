// (C) 2020-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { bucketIsEmpty, IInsightDefinition, insightBucket, insightHasMeasures } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import CheckboxControl from "../configurationControls/CheckboxControl.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import PushpinSizeControl from "../configurationControls/PushpinSizeControl.js";
import PushpinViewportControl from "../configurationControls/PushpinViewportControl.js";
import LegendSection from "../configurationControls/legend/LegendSection.js";
import ColorsSection from "../configurationControls/colors/ColorsSection.js";
import { messages } from "../../../locales.js";

export default class GeoPushpinConfigurationPanel extends ConfigurationPanelContent {
    protected getControlProperties(): { groupNearbyPoints: boolean } {
        const groupNearbyPoints = this.props.properties?.controls?.points?.groupNearbyPoints ?? true;
        return {
            groupNearbyPoints,
        };
    }

    protected renderLegendSection(): React.ReactNode {
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

    protected renderViewportSection(): React.ReactElement {
        const { properties, propertiesMeta, pushData } = this.props;
        return (
            <ConfigSection
                id="map_section"
                title={messages.pointsMapTitle.id}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <PushpinViewportControl
                    properties={properties}
                    disabled={this.isControlDisabled()}
                    pushData={pushData}
                />
            </ConfigSection>
        );
    }

    protected renderPointsSection(): React.ReactElement {
        const { groupNearbyPoints } = this.getControlProperties();

        const { properties, propertiesMeta, pushData, insight } = this.props;
        const isControlDisabled = this.isControlDisabled();
        const isClusteringDisabled =
            isControlDisabled || insightHasMeasures(insight) || hasSegmentAttribute(insight);
        const isPushpinSizeControlDisabled = isControlDisabled || !hasSizeMeasure(insight);
        return (
            <ConfigSection
                id="points_section"
                title={messages.pointsTitle.id}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <CheckboxControl
                    valuePath="points.groupNearbyPoints"
                    labelText={messages.pointsGroupNearbyPoints.id}
                    properties={properties}
                    checked={groupNearbyPoints}
                    disabled={isClusteringDisabled}
                    showDisabledMessage={isClusteringDisabled}
                    pushData={pushData}
                />
                <PushpinSizeControl
                    properties={properties}
                    disabled={isPushpinSizeControlDisabled}
                    pushData={pushData}
                />
            </ConfigSection>
        );
    }

    protected isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        return !hasLocationAttribute(insight) || isError || isLoading;
    }

    protected getBubbleClassNames(): string {
        return cx("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    protected renderConfigurationPanel(): React.ReactNode {
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

    protected renderColorSection(): React.ReactNode {
        const { properties, propertiesMeta, pushData, colors, featureFlags, references, isLoading } =
            this.props;

        const controlsDisabled = this.isControlDisabled();

        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures={true} // hasMeasures is true because Color Config is based on Attribute
                showCustomPicker={featureFlags.enableCustomColorPicker as boolean}
                isLoading={isLoading}
            />
        );
    }
}

function hasColorMeasure(insight: IInsightDefinition): boolean {
    const bucket = insightBucket(insight, BucketNames.COLOR);

    return bucket !== undefined && !bucketIsEmpty(bucket);
}

function hasSizeMeasure(insight: IInsightDefinition): boolean {
    const bucket = insightBucket(insight, BucketNames.SIZE);

    return bucket !== undefined && !bucketIsEmpty(bucket);
}

function hasLocationAttribute(insight: IInsightDefinition): boolean {
    const bucket = insightBucket(insight, BucketNames.LOCATION);

    return bucket !== undefined && !bucketIsEmpty(bucket);
}

function hasSegmentAttribute(insight: IInsightDefinition): boolean {
    const bucket = insightBucket(insight, BucketNames.SEGMENT);

    return bucket !== undefined && !bucketIsEmpty(bucket);
}
