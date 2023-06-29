// (C) 2023 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import ConfigSection from "../configurationControls/ConfigSection.js";
import CheckboxControl from "../configurationControls/CheckboxControl.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import { messages } from "../../../locales.js";
import LegendSection from "../configurationControls/legend/LegendSection.js";
import TotalSection from "../configurationControls/total/TotalSection.js";
import { countItemsOnAxes } from "../pluggableVisualizations/baseChart/insightIntrospection.js";
import { IAxisProperties } from "../../interfaces/AxisType.js";
import NameSubsection from "../configurationControls/axis/NameSubsection.js";
import LabelSubsection from "../configurationControls/axis/LabelSubsection.js";

import BaseChartConfigurationPanel from "./BaseChartConfigurationPanel.js";
import { IConfigurationPanelContentProps } from "./ConfigurationPanelContent.js";

const TOOLTIP_ARROW_OFFSET = { "tc bc": [BUBBLE_ARROW_OFFSET_X, BUBBLE_ARROW_OFFSET_Y] };
const TOOLTIP_ALIGN_POINT = [{ align: "tc bc" }];

export interface IWaterfallChartConfigurationPanel extends IConfigurationPanelContentProps {
    dataLabelDefaultValue?: string | boolean;
}

export default class WaterfallChartConfigurationPanel extends BaseChartConfigurationPanel<IWaterfallChartConfigurationPanel> {
    protected renderConfigurationPanel(): React.ReactNode {
        const { gridEnabled, axes } = this.getControlProperties();

        const { properties, propertiesMeta, pushData, dataLabelDefaultValue = false } = this.props;

        const controlsDisabled = this.isControlDisabled();

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.getBaseChartAxisSection(axes)}
                    {this.renderLegendSection()}

                    <TotalSection
                        controlsDisabled={controlsDisabled}
                        properties={properties}
                        propertiesMeta={propertiesMeta}
                        pushData={pushData}
                    />

                    <ConfigSection
                        id="canvas_section"
                        className="gd-canvas-section"
                        title={messages.canvasTitle.id}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <DataLabelsControl
                            pushData={pushData}
                            properties={properties}
                            isDisabled={controlsDisabled}
                            defaultValue={dataLabelDefaultValue}
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
                    arrowOffsets={TOOLTIP_ARROW_OFFSET}
                    alignPoints={TOOLTIP_ALIGN_POINT}
                >
                    <FormattedMessage id="properties.config.not_applicable" />
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    protected renderLegendSection(): React.ReactNode {
        const { properties, propertiesMeta, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <LegendSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                controlsDisabled={controlsDisabled}
                defaultLegendEnabled={false}
                pushData={pushData}
            />
        );
    }

    protected getBaseChartAxisSection(axes: IAxisProperties[]) {
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
            const isPrimaryAxisWithMoreThanOneItem: boolean =
                (axis.primary || !isAxisNameViewByTwoAttributesEnabled) && itemsOnAxes[axis.name] > 1;
            const nameSubsectionDisabled: boolean = !isViewedBy || isPrimaryAxisWithMoreThanOneItem;
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
                            disabled={nameSubsectionDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={axis.name}
                            properties={properties}
                            pushData={pushData}
                        />
                    ) : null}
                    <LabelSubsection
                        disabled={false}
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
}
