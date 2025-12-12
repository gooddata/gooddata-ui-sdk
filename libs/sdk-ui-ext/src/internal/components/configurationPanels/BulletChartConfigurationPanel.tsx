// (C) 2019-2025 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ConfigurationPanelContent } from "./ConfigurationPanelContent.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { LabelSubsection } from "../configurationControls/axis/LabelSubsection.js";
import { NameSubsection } from "../configurationControls/axis/NameSubsection.js";
import { CheckboxControl } from "../configurationControls/CheckboxControl.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { MinMaxControl } from "../configurationControls/MinMaxControl.js";
import { countItemsOnAxes } from "../pluggableVisualizations/baseChart/insightIntrospection.js";

export class BulletChartConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): ReactNode {
        const { propertiesMeta, properties, pushData, type, insight } = this.props;

        const controls = properties?.controls || {};

        const { xaxis, yaxis, grid } = controls;
        const xAxisVisible = xaxis && typeof xaxis.visible !== "undefined" ? xaxis.visible : true;
        const yAxisVisible = yaxis && typeof yaxis.visible !== "undefined" ? yaxis.visible : true;
        const gridEnabled = grid && typeof grid.enabled !== "undefined" ? grid.enabled : true;

        const controlsDisabled = this.isControlDisabled();
        const { xaxis: itemsOnXAxis, yaxis: itemsOnYAxis } = countItemsOnAxes(type, controls, insight);
        const xAxisNameSectionDisabled = controlsDisabled || itemsOnXAxis !== 1;
        const yAxisNameSubsectionDisabled = controlsDisabled || itemsOnYAxis === 0;

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    <ConfigSection
                        id="xaxis_section"
                        title={messages["xaxisTitle"].id}
                        valuePath="xaxis.visible"
                        canBeToggled
                        toggledOn={xAxisVisible}
                        toggleDisabled={controlsDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <NameSubsection
                            disabled={xAxisNameSectionDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"xaxis"}
                            properties={properties}
                            pushData={pushData}
                        />
                        <LabelSubsection
                            disabled={controlsDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"xaxis"}
                            properties={properties}
                            pushData={pushData}
                            showFormat
                        />
                        {this.renderMinMax("xaxis")}
                    </ConfigSection>
                    <ConfigSection
                        id="yaxis_section"
                        title={messages["yaxisTitle"].id}
                        valuePath="yaxis.visible"
                        canBeToggled
                        toggledOn={yAxisVisible}
                        toggleDisabled={controlsDisabled}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <NameSubsection
                            disabled={yAxisNameSubsectionDisabled}
                            configPanelDisabled={controlsDisabled}
                            axis={"yaxis"}
                            properties={properties}
                            pushData={pushData}
                        />
                        <LabelSubsection
                            disabled={controlsDisabled || itemsOnYAxis === 0}
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

    private getBubbleClassNames() {
        return cx("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }
}
