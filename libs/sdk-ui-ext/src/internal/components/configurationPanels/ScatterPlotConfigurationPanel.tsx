// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

import { insightBucket, insightHasAttributes } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger, Message } from "@gooddata/sdk-ui-kit";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { getMeasuresFromMdObject } from "../../utils/bucketHelper.js";
import LabelSubsection from "../configurationControls/axis/LabelSubsection.js";
import NameSubsection from "../configurationControls/axis/NameSubsection.js";
import CheckboxControl from "../configurationControls/CheckboxControl.js";
import { ClusteringThresholdControl } from "../configurationControls/clustering/ClusteringThresholdControl.js";
import { NumberOfClustersControl } from "../configurationControls/clustering/NumberOfClustersControl.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";
import MinMaxControl from "../configurationControls/MinMaxControl.js";
import { countItemsOnAxes } from "../pluggableVisualizations/baseChart/insightIntrospection.js";

export default class ScatterPlotConfigurationPanel extends ConfigurationPanelContent {
    protected isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        const measures = getMeasuresFromMdObject(insight);
        return !measures || measures.length < 1 || isError || isLoading;
    }

    protected renderConfigurationPanel(): React.ReactNode {
        const { xAxisVisible, gridEnabled, yAxisVisible, clusteringEnabled } = this.getControlProperties();

        const { featureFlags, propertiesMeta, properties, pushData, insight, type } = this.props;
        const controls = properties?.controls;
        const controlsDisabled = this.isControlDisabled();
        const { xaxis: itemsOnXAxis, yaxis: itemsOnYAxis } = countItemsOnAxes(type, controls, insight);
        const xAxisNameSectionDisabled = controlsDisabled || itemsOnXAxis !== 1;
        const yAxisNameSectionDisabled = controlsDisabled || itemsOnYAxis !== 1;
        const isNameSubsectionVisible: boolean = featureFlags.enableAxisNameConfiguration as boolean;
        const isAxisLabelsFormatEnabled: boolean = featureFlags.enableAxisLabelFormat as boolean;
        const showClusteringSection: boolean = featureFlags.enableScatterPlotClustering as boolean;
        const isScatterPlotClusteringDisabled = this.isClusteringDisabled();
        const showingPartialClusters = propertiesMeta?.showingPartialClusters;

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.renderLegendSection()}
                    <ConfigSection
                        id="xaxis_section"
                        title={messages.xaxisTitle.id}
                        valuePath="xaxis.visible"
                        canBeToggled={true}
                        toggledOn={xAxisVisible}
                        toggleDisabled={controlsDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        {isNameSubsectionVisible ? (
                            <NameSubsection
                                disabled={xAxisNameSectionDisabled}
                                configPanelDisabled={controlsDisabled}
                                axis={"xaxis"}
                                properties={properties}
                                pushData={pushData}
                            />
                        ) : null}

                        <LabelSubsection
                            disabled={controlsDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"xaxis"}
                            properties={properties}
                            pushData={pushData}
                            showFormat={isAxisLabelsFormatEnabled}
                        />
                        {this.renderMinMax("xaxis")}
                    </ConfigSection>
                    <ConfigSection
                        id="yaxis_section"
                        title={messages.yaxisTitle.id}
                        valuePath="yaxis.visible"
                        canBeToggled={true}
                        toggledOn={yAxisVisible}
                        toggleDisabled={controlsDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        {isNameSubsectionVisible ? (
                            <NameSubsection
                                disabled={yAxisNameSectionDisabled}
                                configPanelDisabled={controlsDisabled}
                                axis={"yaxis"}
                                properties={properties}
                                pushData={pushData}
                            />
                        ) : null}

                        <LabelSubsection
                            disabled={controlsDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"yaxis"}
                            properties={properties}
                            pushData={pushData}
                            showFormat={isAxisLabelsFormatEnabled}
                        />
                        {this.renderMinMax("yaxis")}
                    </ConfigSection>
                    {this.renderInteractionsSection()}
                    <ConfigSection
                        id="canvas_section"
                        title={messages.canvasTitle.id}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <DataLabelsControl
                            pushData={pushData}
                            properties={properties}
                            isDisabled={this.areDataLabelsDisabled()}
                            defaultValue={false}
                            showDisabledMessage={this.isDataLabelsWarningShown()}
                            enableStyleSelector={!!featureFlags.enableChartAccessibilityFeatures}
                        />
                        <CheckboxControl
                            valuePath="grid.enabled"
                            labelText={messages.canvasGridLine.id}
                            properties={properties}
                            checked={gridEnabled}
                            disabled={controlsDisabled}
                            pushData={pushData}
                        />
                    </ConfigSection>
                    {showClusteringSection ? (
                        <ConfigSection
                            id="clustering_section"
                            title={messages.clusteringTitle.id}
                            propertiesMeta={propertiesMeta}
                            properties={properties}
                            pushData={pushData}
                            valuePath="clustering.enabled"
                            canBeToggled
                            toggledOn={clusteringEnabled}
                            toggleDisabled={controlsDisabled || isScatterPlotClusteringDisabled}
                            showDisabledMessage={isScatterPlotClusteringDisabled}
                            toggleMessageId={defineMessage({ id: "properties.clustering.disabled" }).id}
                        >
                            <NumberOfClustersControl
                                valuePath="clustering.numberOfClusters"
                                disabled={controlsDisabled || isScatterPlotClusteringDisabled}
                                properties={properties}
                                pushData={pushData}
                            />
                            <ClusteringThresholdControl
                                valuePath="clustering.threshold"
                                disabled={controlsDisabled || isScatterPlotClusteringDisabled}
                                properties={properties}
                                pushData={pushData}
                            />
                            {showingPartialClusters ? (
                                <Message type="progress" className="adi-input-progress">
                                    <h4>
                                        <FormattedMessage id="properties.clustering.amount.partial.title" />
                                    </h4>
                                    <FormattedMessage id="properties.clustering.amount.partial.description" />
                                </Message>
                            ) : null}
                        </ConfigSection>
                    ) : null}
                    {this.renderAdvancedSection()}
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

    private renderMinMax(basePath: string) {
        const { pushData, properties, propertiesMeta } = this.props;
        return (
            <MinMaxControl
                isDisabled={this.isControlDisabled()}
                basePath={basePath}
                pushData={pushData}
                properties={properties}
                propertiesMeta={propertiesMeta}
            />
        );
    }

    private areDataLabelsDisabled() {
        const isDisabled = super.isControlDisabled();
        return isDisabled || !insightHasAttributes(this.props.insight);
    }

    private isDataLabelsWarningShown() {
        const isDisabled = super.isControlDisabled();
        return !isDisabled && !insightHasAttributes(this.props.insight);
    }

    private isClusteringDisabled() {
        const isDisabled = super.isControlDisabled();
        const segmentByBucket = this.props?.insight
            ? insightBucket(this.props.insight, BucketNames.SEGMENT)
            : undefined;
        const viewByBucket = this.props?.insight
            ? insightBucket(this.props.insight, BucketNames.ATTRIBUTE)
            : undefined;
        const measuresBucket = this.props?.insight
            ? insightBucket(this.props.insight, BucketNames.MEASURES)
            : undefined;
        const secondaryMeasuresBucket = this.props?.insight
            ? insightBucket(this.props.insight, BucketNames.SECONDARY_MEASURES)
            : undefined;
        const hasSegmentBucketItems = (segmentByBucket?.items?.length ?? 0) > 0;
        const hasViewBucketItems = (viewByBucket?.items?.length ?? 0) > 0;
        const hasXAxisMeasure = (measuresBucket?.items?.length ?? 0) === 1;
        const hasYAxisMeasure = (secondaryMeasuresBucket?.items?.length ?? 0) === 1;
        return (
            isDisabled || hasSegmentBucketItems || !hasViewBucketItems || !hasXAxisMeasure || !hasYAxisMeasure
        );
    }

    private getBubbleClassNames() {
        return cx("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    private getControlProperties() {
        const propertiesControls = this.props.properties?.controls;

        const xAxisVisible = propertiesControls?.xaxis?.visible ?? true;
        const yAxisVisible = propertiesControls?.yaxis?.visible ?? true;
        const gridEnabled = propertiesControls?.grid?.enabled ?? true;
        const clusteringEnabled = propertiesControls?.clustering?.enabled ?? false;

        return {
            xAxisVisible,
            yAxisVisible,
            gridEnabled,
            clusteringEnabled,
        };
    }
}
