// (C) 2020 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import classNames from "classnames";
import get = require("lodash/get");

import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";

import ConfigurationPanelContent from "./ConfigurationPanelContent";
import CheckboxControl from "../configurationControls/CheckboxControl";
import ConfigSection from "../configurationControls/ConfigSection";
import PushpinSizeControl from "../configurationControls/PushpinSizeControl";
import PushpinViewportControl from "../configurationControls/PushpinViewportControl";
import LegendSection from "../configurationControls/legend/LegendSection";
import ColorsSection from "../configurationControls/colors/ColorsSection";
import { bucketIsEmpty, IInsightDefinition, insightBucket, insightHasMeasures } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

export default class GeoPushpinConfigurationPanel extends ConfigurationPanelContent {
    protected getControlProperties() {
        const { props } = this;
        const groupNearbyPoints = get(props, "properties.controls.points.groupNearbyPoints", true);

        return {
            groupNearbyPoints,
        };
    }

    protected renderLegendSection() {
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
                title="properties.map.title"
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
                title="properties.points.title"
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <CheckboxControl
                    valuePath="points.groupNearbyPoints"
                    labelText="properties.points.groupNearbyPoints"
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

    protected isControlDisabled() {
        const { insight, isError, isLoading } = this.props;
        return !hasLocationAttribute(insight) || isError || isLoading;
    }

    protected getBubbleClassNames() {
        return classNames("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    protected renderConfigurationPanel() {
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

    protected renderColorSection() {
        const {
            properties,
            propertiesMeta,
            pushData,
            colors,
            featureFlags,
            references,
            isLoading,
        } = this.props;

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
