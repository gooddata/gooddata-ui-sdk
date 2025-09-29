// (C) 2019-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { IInsightDefinition, insightBuckets } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { AxisType } from "../../interfaces/AxisType.js";
import { noColumnsAndHasOneMeasure, noRowsAndHasOneMeasure } from "../../utils/bucketHelper.js";
import LabelSubsection from "../configurationControls/axis/LabelSubsection.js";
import NameSubsection from "../configurationControls/axis/NameSubsection.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";

export default class HeatMapConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): ReactNode {
        const { featureFlags, propertiesMeta, properties, pushData } = this.props;
        const { xAxisVisible, yAxisVisible } = this.getControlProperties();

        const controlsDisabled = this.isControlDisabled();
        const xAxisDisabled = this.isAxisDisabled(controlsDisabled, "xaxis", this.props.insight);
        const yAxisDisabled = this.isAxisDisabled(controlsDisabled, "yaxis", this.props.insight);

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    <ConfigSection
                        id="xaxis_section"
                        title={messages["xaxisTitle"].id}
                        valuePath="xaxis.visible"
                        canBeToggled={true}
                        toggledOn={xAxisVisible}
                        toggleDisabled={xAxisDisabled}
                        showDisabledMessage={!controlsDisabled && xAxisDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <NameSubsection
                            disabled={xAxisDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"xaxis"}
                            properties={properties}
                            pushData={pushData}
                        />

                        <LabelSubsection
                            disabled={xAxisDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"xaxis"}
                            properties={properties}
                            pushData={pushData}
                        />
                    </ConfigSection>
                    <ConfigSection
                        id="yaxis_section"
                        title={messages["yaxisTitle"].id}
                        valuePath="yaxis.visible"
                        canBeToggled={true}
                        toggledOn={yAxisVisible}
                        toggleDisabled={yAxisDisabled}
                        showDisabledMessage={!controlsDisabled && yAxisDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <NameSubsection
                            disabled={yAxisDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"yaxis"}
                            properties={properties}
                            pushData={pushData}
                        />

                        <LabelSubsection
                            disabled={yAxisDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"yaxis"}
                            properties={properties}
                            pushData={pushData}
                        />
                    </ConfigSection>
                    {this.renderLegendSection()}
                    {this.renderInteractionsSection()}
                    <ConfigSection
                        id="canvas_section"
                        title={messages["canvasTitle"].id}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <DataLabelsControl
                            pushData={pushData}
                            properties={properties}
                            isDisabled={controlsDisabled}
                            defaultValue="auto"
                            enableStyleSelector={!!featureFlags.enableChartAccessibilityFeatures}
                        />
                    </ConfigSection>
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

    private getBubbleClassNames() {
        return cx("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    private getControlProperties() {
        const propertiesControls = this.props.properties?.controls;
        const xAxisVisible = propertiesControls?.["xaxis"]?.visible ?? true;
        const yAxisVisible = propertiesControls?.["yaxis"]?.visible ?? true;
        return {
            xAxisVisible,
            yAxisVisible,
        };
    }

    private isAxisDisabled(controlsDisabled: boolean, axis: AxisType, insight: IInsightDefinition): boolean {
        const isAxisDisabled =
            axis === "xaxis"
                ? noColumnsAndHasOneMeasure(insightBuckets(insight))
                : noRowsAndHasOneMeasure(insightBuckets(insight));

        return Boolean(controlsDisabled || isAxisDisabled);
    }
}
