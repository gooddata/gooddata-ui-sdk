// (C) 2023 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import ConfigSection from "../configurationControls/ConfigSection";
import CheckboxControl from "../configurationControls/CheckboxControl";
import DataLabelsControl from "../configurationControls/DataLabelsControl";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble";
import { messages } from "../../../locales";
import LegendSection from "../configurationControls/legend/LegendSection";

import BaseChartConfigurationPanel from "./BaseChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "./ConfigurationPanelContent";
import TotalSection from "../configurationControls/total/TotalSection";

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
}
