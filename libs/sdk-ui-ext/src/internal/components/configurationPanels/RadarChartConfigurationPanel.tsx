// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import {
    getChartFillIgnoredMeasureIdsFromMdObject,
    getMeasuresFromMdObject,
} from "../../utils/bucketHelper.js";
import { CheckboxControl } from "../configurationControls/CheckboxControl.js";
import { ColorsSection } from "../configurationControls/colors/ColorsSection.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { ConfigSubsection } from "../configurationControls/ConfigSubsection.js";
import { ContinuousLineControl } from "../configurationControls/ContinuousLineControl.js";
import { DataLabelsControl } from "../configurationControls/DataLabelsControl.js";
import { DataPointsControl } from "../configurationControls/DataPointsControl.js";
import { DistinctPointShapesControl } from "../configurationControls/DistintcPointShapesControl.js";
import { MinMaxControl } from "../configurationControls/MinMaxControl.js";
import { RadarGridLineShapeControl } from "../configurationControls/RadarGridLineShapeControl.js";
import { RadarRenderAsControl } from "../configurationControls/RadarRenderAsControl.js";

import { LineChartBasedConfigurationPanel } from "./LineChartBasedConfigurationPanel.js";

export class RadarChartConfigurationPanel extends LineChartBasedConfigurationPanel {
    protected override renderConfigurationPanel(): ReactNode {
        const { properties, propertiesMeta, pushData, panelConfig } = this.props;
        const {
            isDataPointsControlDisabled,
            isContinuousLineControlDisabled,
            isDistinctPointShapesDisabled,
        } = panelConfig;

        const controlsDisabled = this.isControlDisabled();
        const continuousLineEnabled = properties?.controls?.["continuousLine"]?.enabled;
        const shouldContinuousLineControlDisabled = controlsDisabled || isContinuousLineControlDisabled;

        const distinctPointShapesEnabled = properties?.controls?.["distinctPointShapes"]?.enabled;
        const shouldDistinctPointShapesDisabled =
            controlsDisabled || isDataPointsControlDisabled || Boolean(isDistinctPointShapesDisabled);

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.renderRadarGridSection()}
                    {this.renderLegendSection()}
                    {this.renderInteractionsSection()}
                    <ConfigSection
                        id="canvas_section"
                        className="gd-canvas-section"
                        title={messages["canvasTitle"].id}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <DataLabelsControl
                            pushData={pushData}
                            properties={properties}
                            isDisabled={controlsDisabled}
                            defaultValue={false}
                        />
                        <DataPointsControl
                            pushData={pushData}
                            properties={properties}
                            isDisabled={controlsDisabled || isDataPointsControlDisabled}
                            showDisabledMessage={isDataPointsControlDisabled}
                        />
                        <DistinctPointShapesControl
                            pushData={pushData}
                            checked={shouldDistinctPointShapesDisabled ? false : distinctPointShapesEnabled}
                            properties={properties}
                            disabled={shouldDistinctPointShapesDisabled}
                        />
                        <ContinuousLineControl
                            properties={properties}
                            checked={shouldContinuousLineControlDisabled ? false : continuousLineEnabled}
                            disabled={controlsDisabled || isDataPointsControlDisabled}
                            pushData={pushData}
                        />
                    </ConfigSection>
                    {this.renderAnomaliesSection()}
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

    /**
     * Replaces the separate X-Axis and Y-Axis sections with a single "Grid" section.
     * The section toggle controls grid.enabled. Rotation and axis name controls are omitted.
     */
    private renderRadarGridSection(): ReactNode {
        const { properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();
        const gridEnabled = properties?.controls?.["grid"]?.enabled ?? true;
        const xAxisLabelsEnabled = properties?.controls?.["xaxis"]?.labelsEnabled ?? true;
        const yAxisLabelsEnabled = properties?.controls?.["yaxis"]?.labelsEnabled ?? true;

        return (
            <ConfigSection
                id="radar_grid_section"
                title={messages["radarGridSectionTitle"].id}
                valuePath="grid.enabled"
                canBeToggled
                toggledOn={gridEnabled}
                toggleDisabled={controlsDisabled}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <RadarGridLineShapeControl
                    disabled={controlsDisabled}
                    properties={properties!}
                    pushData={pushData!}
                />
                <ConfigSubsection title={messages["radarLabelsSubsection"].id}>
                    <CheckboxControl
                        valuePath="xaxis.labelsEnabled"
                        labelText={messages["radarSpokeLabels"].id}
                        properties={properties}
                        checked={xAxisLabelsEnabled}
                        disabled={controlsDisabled}
                        pushData={pushData}
                    />
                    <CheckboxControl
                        valuePath="yaxis.labelsEnabled"
                        labelText={messages["radarRadialLabels"].id}
                        properties={properties}
                        checked={yAxisLabelsEnabled}
                        disabled={controlsDisabled}
                        pushData={pushData}
                    />
                </ConfigSubsection>
                <MinMaxControl
                    isDisabled={controlsDisabled}
                    basePath="yaxis"
                    pushData={pushData!}
                    properties={properties}
                    propertiesMeta={propertiesMeta}
                />
            </ConfigSection>
        );
    }

    protected override renderColorSection(): ReactNode {
        const { properties, propertiesMeta, pushData, colors, references, insight, isLoading } = this.props;
        const controlsDisabled = this.isControlDisabled();
        const hasMeasures = getMeasuresFromMdObject(insight!).length > 0;
        const chartFillIgnoredMeasures = getChartFillIgnoredMeasureIdsFromMdObject(insight, properties);
        const isOutlineMode = (properties?.controls?.["radarRenderAs"] ?? "filled") === "outline";

        return (
            <ColorsSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                references={references}
                colors={colors}
                controlsDisabled={controlsDisabled}
                pushData={pushData}
                hasMeasures={hasMeasures}
                isLoading={isLoading}
                supportsChartFill
                chartFillIgnoredMeasures={chartFillIgnoredMeasures}
                isChartFillDisabled={isOutlineMode}
                additionalControls={
                    <div className="gd-chart-fill-section">
                        <RadarRenderAsControl
                            disabled={controlsDisabled}
                            properties={properties!}
                            pushData={pushData!}
                        />
                    </div>
                }
            />
        );
    }
}
