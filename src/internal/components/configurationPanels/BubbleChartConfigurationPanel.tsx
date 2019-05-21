// (C) 2019 GoodData Corporation
import * as React from "react";
import get = require("lodash/get");
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import * as classNames from "classnames";

import ConfigurationPanelContent from "./ConfigurationPanelContent";
import LabelSubsection from "../configurationControls/axis/LabelSubsection";
import ConfigSection from "../configurationControls/ConfigSection";
import DataLabelsControl from "../configurationControls/DataLabelsControl";
import CheckboxControl from "../configurationControls/CheckboxControl";
import { getTranslation } from "../../utils/translations";
import MinMaxControl from "../configurationControls//MinMaxControl";
import { hasTertiaryMeasures } from "../../utils/mdObjectHelper";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble";

export default class BubbleChartConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel() {
        const { xAxisVisible, yAxisVisible, gridEnabled } = this.getControlProperties();

        const { propertiesMeta, properties, intl, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    <ConfigSection
                        id="xaxis_section"
                        title="properties.xaxis.title"
                        valuePath="xaxis.visible"
                        intl={intl}
                        canBeToggled={true}
                        toggledOn={xAxisVisible}
                        toggleDisabled={controlsDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <LabelSubsection
                            disabled={controlsDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"xaxis"}
                            intl={intl}
                            properties={properties}
                            pushData={pushData}
                        />
                        {this.renderMinMax("xaxis")}
                    </ConfigSection>
                    <ConfigSection
                        id="yaxis_section"
                        title="properties.yaxis.title"
                        valuePath="yaxis.visible"
                        intl={intl}
                        canBeToggled={true}
                        toggledOn={yAxisVisible}
                        toggleDisabled={controlsDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <LabelSubsection
                            disabled={controlsDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"yaxis"}
                            intl={intl}
                            properties={properties}
                            pushData={pushData}
                        />
                        {this.renderMinMax("yaxis")}
                    </ConfigSection>
                    {this.renderLegendSection()}
                    <ConfigSection
                        id="canvas_section"
                        title="properties.canvas.title"
                        intl={intl}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <DataLabelsControl
                            pushData={pushData}
                            properties={properties}
                            intl={intl}
                            isDisabled={this.areDataLabelsDisabled()}
                            defaultValue={false}
                            showDisabledMessage={this.isDataLabelsWarningShown()}
                        />
                        <CheckboxControl
                            valuePath="grid.enabled"
                            labelText="properties.canvas.gridline"
                            intl={intl}
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
                    {getTranslation("properties.config.not_applicable", intl)}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    private renderMinMax(basePath: string) {
        const { pushData, properties, intl, propertiesMeta } = this.props;
        return (
            <MinMaxControl
                isDisabled={this.isControlDisabled()}
                basePath={basePath}
                pushData={pushData}
                intl={intl}
                properties={properties}
                propertiesMeta={propertiesMeta}
            />
        );
    }

    private areDataLabelsDisabled() {
        const isDisabled = super.isControlDisabled();
        return isDisabled || !hasTertiaryMeasures(this.props.mdObject);
    }

    private isDataLabelsWarningShown() {
        const isDisabled = super.isControlDisabled();
        return !isDisabled && !hasTertiaryMeasures(this.props.mdObject);
    }

    private getBubbleClassNames() {
        return classNames("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    private getControlProperties() {
        const xAxisVisible = get(this.props, "properties.controls.xaxis.visible", true);
        const yAxisVisible = get(this.props, "properties.controls.yaxis.visible", true);
        const gridEnabled = get(this.props, "properties.controls.grid.enabled", true);

        return {
            xAxisVisible,
            gridEnabled,
            yAxisVisible,
        };
    }
}
