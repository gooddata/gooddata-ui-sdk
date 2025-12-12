// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { type IInsightDefinition, bucketIsEmpty, insightBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { ConfigurationPanelContent } from "./ConfigurationPanelContent.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";

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
export class GeoAreaConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): ReactNode {
        return (
            <div>
                {/* Legend Configuration */}
                {this.renderLegendSection()}

                {/* Color Configuration */}
                {this.renderColorSection()}

                {/* Canvas Configuration */}
                {this.renderInteractionsSection()}
            </div>
        );
    }

    protected override renderColorSection(): ReactNode {
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
                hasMeasures // color configuration is category-driven
                isLoading={isLoading}
                isChartAccessibilityFeaturesEnabled={!!featureFlags.enableChartAccessibilityFeatures}
                supportsChartFill={false}
            />
        );
    }

    protected override isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        return !hasAreaAttribute(insight) || isError || isLoading;
    }
}

function hasAreaAttribute(insight?: IInsightDefinition): boolean {
    if (!insight) {
        return false;
    }

    const bucket = insightBucket(insight, BucketNames.AREA);
    return bucket !== undefined && !bucketIsEmpty(bucket);
}
