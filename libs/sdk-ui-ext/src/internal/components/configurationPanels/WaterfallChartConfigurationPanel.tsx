// (C) 2023-2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { BaseChartConfigurationPanel } from "./BaseChartConfigurationPanel.js";
import { type IConfigurationPanelContentProps } from "./ConfigurationPanelContent.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { type IAxisProperties } from "../../interfaces/AxisType.js";
import { LabelSubsection } from "../configurationControls/axis/LabelSubsection.js";
import { NameSubsection } from "../configurationControls/axis/NameSubsection.js";
import { CheckboxControl } from "../configurationControls/CheckboxControl.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { DataLabelsControl } from "../configurationControls/DataLabelsControl.js";
import { LegendSection } from "../configurationControls/legend/LegendSection.js";
import { OrientationDropdownControl } from "../configurationControls/OrientationDropdownControl.js";
import { TotalSection } from "../configurationControls/total/TotalSection.js";
import { countItemsOnAxes } from "../pluggableVisualizations/baseChart/insightIntrospection.js";

const TOOLTIP_ARROW_OFFSET = { "tc bc": [BUBBLE_ARROW_OFFSET_X, BUBBLE_ARROW_OFFSET_Y] };
const TOOLTIP_ALIGN_POINT = [{ align: "tc bc" }];

export interface IWaterfallChartConfigurationPanel extends IConfigurationPanelContentProps {
    dataLabelDefaultValue?: string | boolean;
}

export class WaterfallChartConfigurationPanel extends BaseChartConfigurationPanel<IWaterfallChartConfigurationPanel> {
    protected override renderConfigurationPanel(): ReactNode {
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
                        properties={properties!}
                        propertiesMeta={propertiesMeta}
                        pushData={pushData!}
                    />

                    {this.renderInteractionsSection()}

                    <ConfigSection
                        id="canvas_section"
                        className="gd-canvas-section"
                        title={messages["canvasTitle"].id}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <OrientationDropdownControl
                            pushData={pushData!}
                            properties={properties!}
                            disabled={controlsDisabled}
                            value={properties?.controls?.["orientation"]?.position || "horizontal"}
                            showDisabledMessage={false}
                        />

                        <DataLabelsControl
                            pushData={pushData}
                            properties={properties}
                            isDisabled={controlsDisabled}
                            defaultValue={dataLabelDefaultValue}
                        />

                        <CheckboxControl
                            valuePath="grid.enabled"
                            labelText={messages["canvasGridLine"].id}
                            properties={properties}
                            checked={gridEnabled}
                            disabled={controlsDisabled}
                            pushData={pushData}
                        />
                    </ConfigSection>
                    {this.renderAdvancedSection()}
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

    protected override renderLegendSection(): ReactNode {
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

    protected override getBaseChartAxisSection(axes: IAxisProperties[]) {
        const { type, properties, propertiesMeta, pushData, insight } = this.props;
        const controls = properties?.controls;
        const controlsDisabled = this.isControlDisabled();
        const isViewedBy = this.isViewedBy();
        const itemsOnAxes = countItemsOnAxes(type, controls ?? {}, insight);

        return axes.map((axis: IAxisProperties) => {
            const isPrimaryAxis =
                controls?.["orientation"]?.position === "vertical" ? axis.name === "xaxis" : axis.primary;
            const isPrimaryAxisWithMoreThanOneItem: boolean =
                isPrimaryAxis && (itemsOnAxes?.[axis.name] ?? 0) > 1;
            const nameSubsectionDisabled: boolean = !isViewedBy || isPrimaryAxisWithMoreThanOneItem;
            const { name, title, subtitle, visible } = axis;

            return (
                <ConfigSection
                    key={name}
                    id={`${name}_section`}
                    title={title}
                    subtitle={subtitle}
                    valuePath={`${name}.visible`}
                    canBeToggled
                    toggledOn={visible}
                    toggleDisabled={controlsDisabled}
                    propertiesMeta={propertiesMeta}
                    properties={properties}
                    pushData={pushData}
                >
                    <NameSubsection
                        disabled={nameSubsectionDisabled}
                        configPanelDisabled={controlsDisabled}
                        axis={axis.name}
                        properties={properties}
                        pushData={pushData}
                    />
                    <LabelSubsection
                        disabled={false}
                        configPanelDisabled={controlsDisabled}
                        axis={axis.name}
                        properties={properties}
                        pushData={pushData}
                        showFormat={isPrimaryAxis}
                    />
                    {isPrimaryAxis ? this.renderMinMax(axis.name) : null}
                </ConfigSection>
            );
        });
    }
}
