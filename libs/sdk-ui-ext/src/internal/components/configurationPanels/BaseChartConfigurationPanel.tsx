// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import includes from "lodash/includes.js";
import isEmpty from "lodash/isEmpty.js";
import { BucketNames } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import MinMaxControl from "../configurationControls/MinMaxControl.js";
import ConfigurationPanelContent, { IConfigurationPanelContentProps } from "./ConfigurationPanelContent.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import CheckboxControl from "../configurationControls/CheckboxControl.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import LabelSubsection from "../configurationControls/axis/LabelSubsection.js";
import { IAxisProperties } from "../../interfaces/AxisType.js";
import { AXIS, BASE_CHART_AXIS_CONFIG, DUAL_AXES_SUPPORTED_CHARTS } from "../../constants/axis.js";
import { bucketsById, bucketsIsEmpty, insightBuckets } from "@gooddata/sdk-model";
import { countItemsOnAxes } from "../pluggableVisualizations/baseChart/insightIntrospection.js";
import NameSubsection from "../configurationControls/axis/NameSubsection.js";
import { messages } from "../../../locales.js";

export default class BaseChartConfigurationPanel<
    T extends IConfigurationPanelContentProps = IConfigurationPanelContentProps,
> extends ConfigurationPanelContent<T> {
    protected renderCanvasSection(): React.ReactNode {
        const { gridEnabled } = this.getControlProperties();

        const { properties, propertiesMeta, pushData, featureFlags, insight } = this.props;
        const controlsDisabled = this.isControlDisabled();
        const { buckets } = insight.insight;

        const stackBy = bucketsById(buckets, BucketNames.STACK);
        const isNotStacked = isEmpty(stackBy);

        return (
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
                    isTotalsDisabled={
                        controlsDisabled ||
                        !!properties?.controls?.stackMeasuresToPercent ||
                        (isNotStacked && !properties?.controls?.stackMeasures)
                    }
                    enableSeparateTotalLabels={!!featureFlags.enableSeparateTotalLabels}
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
        );
    }

    protected renderConfigurationPanel(): React.ReactNode {
        const { axes } = this.getControlProperties();

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.getBaseChartAxisSection(axes)}
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

    protected getControlProperties(): { gridEnabled: boolean; axes: IAxisProperties[] } {
        const props = this.props;
        const gridEnabled = props.properties?.controls?.grid?.enabled ?? true;
        const axisType = includes(DUAL_AXES_SUPPORTED_CHARTS, props.type)
            ? props.axis ?? AXIS.PRIMARY
            : AXIS.PRIMARY;
        const configurations = this.getAxesConfiguration(axisType);
        const axes: IAxisProperties[] = configurations.map((axis: any) => {
            return {
                ...axis,
                visible: props.properties?.controls?.[axis.name]?.visible ?? true,
            };
        });

        return {
            gridEnabled,
            axes,
        };
    }

    protected getBubbleClassNames(): string {
        return cx("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }

    protected isViewedBy(): boolean {
        const { insight } = this.props;

        return !bucketsIsEmpty(insightBuckets(insight, BucketNames.VIEW, BucketNames.TREND));
    }

    protected getBaseChartAxisSection(axes: IAxisProperties[]): React.ReactNode {
        const { featureFlags, type, properties, propertiesMeta, pushData, insight } = this.props;
        const controls = properties?.controls;
        const controlsDisabled = this.isControlDisabled();
        const isViewedBy = this.isViewedBy();
        const itemsOnAxes = countItemsOnAxes(type, controls, insight);
        const isNameSubsectionVisible: boolean = featureFlags.enableAxisNameConfiguration as boolean;
        const isAxisLabelsFormatEnabled: boolean = featureFlags.enableAxisLabelFormat as boolean;
        const isAxisNameViewByTwoAttributesEnabled: boolean =
            featureFlags.enableAxisNameViewByTwoAttributes as boolean;

        return axes.map((axis: IAxisProperties) => {
            const disabled = controlsDisabled || (!axis.primary && !isViewedBy);
            const nameSubsectionDisabled: boolean =
                (axis.primary || !isAxisNameViewByTwoAttributesEnabled) && itemsOnAxes[axis.name] > 1;
            const { name, title, subtitle, visible } = axis;

            const showFormat = axis.primary && isAxisLabelsFormatEnabled;

            return (
                <ConfigSection
                    key={name}
                    id={`${name}_section`}
                    title={title}
                    subtitle={subtitle}
                    valuePath={`${name}.visible`}
                    canBeToggled={true}
                    toggledOn={visible}
                    toggleDisabled={controlsDisabled}
                    propertiesMeta={propertiesMeta}
                    properties={properties}
                    pushData={pushData}
                >
                    {isNameSubsectionVisible ? (
                        <NameSubsection
                            disabled={disabled || nameSubsectionDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={axis.name}
                            properties={properties}
                            pushData={pushData}
                        />
                    ) : null}
                    <LabelSubsection
                        disabled={disabled}
                        configPanelDisabled={controlsDisabled}
                        axis={axis.name}
                        properties={properties}
                        pushData={pushData}
                        showFormat={showFormat}
                    />
                    {axis.primary ? this.renderMinMax(axis.name) : null}
                </ConfigSection>
            );
        });
    }

    protected renderMinMax(basePath: string): React.ReactNode {
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
