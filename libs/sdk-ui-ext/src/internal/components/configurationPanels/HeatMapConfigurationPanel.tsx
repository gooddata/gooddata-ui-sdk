// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import NameSubsection from "../configurationControls/axis/NameSubsection.js";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import LabelSubsection from "../configurationControls/axis/LabelSubsection.js";
import { AxisType } from "../../interfaces/AxisType.js";
import { noRowsAndHasOneMeasure, noColumnsAndHasOneMeasure } from "../../utils/bucketHelper.js";
import { IInsightDefinition, insightBuckets } from "@gooddata/sdk-model";
import { messages } from "../../../locales.js";

export default class HeatMapConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): React.ReactNode {
        const { featureFlags, propertiesMeta, properties, pushData } = this.props;
        const { xAxisVisible, yAxisVisible } = this.getControlProperties();

        const controlsDisabled = this.isControlDisabled();
        const xAxisDisabled = this.isAxisDisabled(controlsDisabled, "xaxis", this.props.insight);
        const yAxisDisabled = this.isAxisDisabled(controlsDisabled, "yaxis", this.props.insight);
        const isNameSubsectionVisible: boolean = featureFlags.enableAxisNameConfiguration as boolean;

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    <ConfigSection
                        id="xaxis_section"
                        title={messages.xaxisTitle.id}
                        valuePath="xaxis.visible"
                        canBeToggled={true}
                        toggledOn={xAxisVisible}
                        toggleDisabled={xAxisDisabled}
                        showDisabledMessage={!controlsDisabled && xAxisDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        {isNameSubsectionVisible ? (
                            <NameSubsection
                                disabled={xAxisDisabled}
                                configPanelDisabled={controlsDisabled}
                                axis={"xaxis"}
                                properties={properties}
                                pushData={pushData}
                            />
                        ) : null}

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
                        title={messages.yaxisTitle.id}
                        valuePath="yaxis.visible"
                        canBeToggled={true}
                        toggledOn={yAxisVisible}
                        toggleDisabled={yAxisDisabled}
                        showDisabledMessage={!controlsDisabled && yAxisDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        {isNameSubsectionVisible ? (
                            <NameSubsection
                                disabled={yAxisDisabled}
                                configPanelDisabled={controlsDisabled}
                                axis={"yaxis"}
                                properties={properties}
                                pushData={pushData}
                            />
                        ) : null}

                        <LabelSubsection
                            disabled={yAxisDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"yaxis"}
                            properties={properties}
                            pushData={pushData}
                        />
                    </ConfigSection>
                    {this.renderLegendSection()}
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
                            isDisabled={controlsDisabled}
                            defaultValue="auto"
                        />
                    </ConfigSection>
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
        const xAxisVisible = propertiesControls?.xaxis?.visible ?? true;
        const yAxisVisible = propertiesControls?.yaxis?.visible ?? true;
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
