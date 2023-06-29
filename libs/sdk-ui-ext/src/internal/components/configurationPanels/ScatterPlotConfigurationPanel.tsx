// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import LabelSubsection from "../configurationControls/axis/LabelSubsection.js";
import MinMaxControl from "../configurationControls/MinMaxControl.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";
import CheckboxControl from "../configurationControls/CheckboxControl.js";
import { getMeasuresFromMdObject } from "../../utils/bucketHelper.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { insightHasAttributes } from "@gooddata/sdk-model";
import NameSubsection from "../configurationControls/axis/NameSubsection.js";
import { countItemsOnAxes } from "../pluggableVisualizations/baseChart/insightIntrospection.js";
import { messages } from "../../../locales.js";

export default class ScatterPlotConfigurationPanel extends ConfigurationPanelContent {
    protected isControlDisabled(): boolean {
        const { insight, isError, isLoading } = this.props;
        const measures = getMeasuresFromMdObject(insight);
        return !measures || measures.length < 1 || isError || isLoading;
    }

    protected renderConfigurationPanel(): React.ReactNode {
        const { xAxisVisible, gridEnabled, yAxisVisible } = this.getControlProperties();

        const { featureFlags, propertiesMeta, properties, pushData, insight, type } = this.props;
        const controls = properties?.controls;
        const controlsDisabled = this.isControlDisabled();
        const { xaxis: itemsOnXAxis, yaxis: itemsOnYAxis } = countItemsOnAxes(type, controls, insight);
        const xAxisNameSectionDisabled = controlsDisabled || itemsOnXAxis !== 1;
        const yAxisNameSectionDisabled = controlsDisabled || itemsOnYAxis !== 1;
        const isNameSubsectionVisible: boolean = featureFlags.enableAxisNameConfiguration as boolean;
        const isAxisLabelsFormatEnabled: boolean = featureFlags.enableAxisLabelFormat as boolean;

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

        return {
            xAxisVisible,
            yAxisVisible,
            gridEnabled,
        };
    }
}
