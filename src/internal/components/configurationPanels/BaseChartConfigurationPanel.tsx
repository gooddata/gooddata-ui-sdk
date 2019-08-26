// (C) 2019 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import get = require("lodash/get");
import includes = require("lodash/includes");
import * as BucketNames from "../../../constants/bucketNames";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import * as classNames from "classnames";

import MinMaxControl from "../configurationControls//MinMaxControl";
import ConfigurationPanelContent from "./ConfigurationPanelContent";
import ConfigSection from "../configurationControls/ConfigSection";
import CheckboxControl from "../configurationControls/CheckboxControl";
import DataLabelsControl from "../configurationControls/DataLabelsControl";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble";
import LabelSubsection from "../configurationControls/axis/LabelSubsection";
import { IAxisProperties } from "../../interfaces/AxisType";
import { AXIS, BASE_CHART_AXIS_CONFIG, DUAL_AXES_SUPPORTED_CHARTS } from "../../constants/axis";
import { IVisualizationProperties } from "../../interfaces/Visualization";

export default class BaseChartConfigurationPanel extends ConfigurationPanelContent {
    protected renderCanvasSection() {
        const { gridEnabled } = this.getControlProperties();

        const { properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();
        return (
            <ConfigSection
                id="canvas_section"
                title="properties.canvas.title"
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={pushData}
            >
                <DataLabelsControl
                    pushData={pushData}
                    properties={properties}
                    isDisabled={controlsDisabled}
                />
                <CheckboxControl
                    valuePath="grid.enabled"
                    labelText="properties.canvas.gridline"
                    properties={properties}
                    checked={gridEnabled}
                    disabled={controlsDisabled}
                    pushData={pushData}
                />
            </ConfigSection>
        );
    }

    protected renderConfigurationPanel() {
        const { axes } = this.getControlProperties();

        const { properties, propertiesMeta } = this.props;

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.getBaseChartAxisSection(properties, propertiesMeta, axes)}
                    {this.renderLegendSection()}
                    {this.renderCanvasSection()}
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

    protected getAxesConfiguration(type: string): any[] {
        return BASE_CHART_AXIS_CONFIG[type];
    }

    protected getControlProperties() {
        const props = this.props;
        const gridEnabled = get(props, "properties.controls.grid.enabled", true);
        const axisType = includes(DUAL_AXES_SUPPORTED_CHARTS, props.type)
            ? get(props, "axis") || AXIS.PRIMARY
            : AXIS.PRIMARY;
        const configurations = this.getAxesConfiguration(axisType);
        const axes: IAxisProperties[] = configurations.map((axis: any) => {
            return {
                ...axis,
                visible: get(props, `properties.controls.${axis.name}.visible`, true),
            };
        });

        return {
            gridEnabled,
            axes,
        };
    }

    protected getBubbleClassNames() {
        return classNames("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    protected isViewedBy() {
        const { mdObject } = this.props;
        return (
            mdObject &&
            mdObject.buckets
                .filter(
                    bucket =>
                        [BucketNames.VIEW, BucketNames.TREND].indexOf(get(bucket, "localIdentifier")) >= 0,
                )
                .some(bucket => get(bucket, "items").length > 0)
        );
    }

    protected getBaseChartAxisSection(
        properties: IVisualizationProperties,
        propertiesMeta: any,
        axes: IAxisProperties[],
    ) {
        const controlsDisabled = this.isControlDisabled();
        const isViewedBy = this.isViewedBy();

        return axes.map(axis => (
            <ConfigSection
                key={axis.name}
                id={`${axis.name}_section`}
                title={axis.title}
                subtitle={axis.subtitle}
                valuePath={`${axis.name}.visible`}
                canBeToggled={true}
                toggledOn={axis.visible}
                toggleDisabled={controlsDisabled}
                propertiesMeta={propertiesMeta}
                properties={properties}
                pushData={this.props.pushData}
            >
                <LabelSubsection
                    disabled={controlsDisabled || (!axis.primary && !isViewedBy)}
                    configPanelDisabled={controlsDisabled}
                    axis={axis.name}
                    properties={properties}
                    pushData={this.props.pushData}
                />
                {axis.primary && this.renderMinMax(axis.name)}
            </ConfigSection>
        ));
    }

    protected renderMinMax(basePath: string) {
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
}
