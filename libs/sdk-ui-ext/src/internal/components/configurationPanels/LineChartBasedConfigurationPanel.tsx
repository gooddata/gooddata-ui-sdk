// (C) 2019 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import ConfigSection from "../configurationControls/ConfigSection";
import CheckboxControl from "../configurationControls/CheckboxControl";
import DataLabelsControl from "../configurationControls/DataLabelsControl";
import DataPointsControl from "../configurationControls/DataPointsControl";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble";
import BaseChartConfigurationPanel from "./BaseChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "./ConfigurationPanelContent";

export interface ILineChartBasedConfigurationPanel extends IConfigurationPanelContentProps {
    dataLabelDefaultValue?: string | boolean;
}

export default class LineChartBasedConfigurationPanel extends BaseChartConfigurationPanel<ILineChartBasedConfigurationPanel> {
    protected renderConfigurationPanel(): React.ReactNode {
        const { gridEnabled, axes } = this.getControlProperties();

        const {
            featureFlags,
            properties,
            propertiesMeta,
            pushData,
            panelConfig,
            dataLabelDefaultValue = false,
        } = this.props;
        const { isDataPointsControlDisabled } = panelConfig;

        const controlsDisabled = this.isControlDisabled();

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.getBaseChartAxisSection(axes)}
                    {this.renderLegendSection()}
                    <ConfigSection
                        id="canvas_section"
                        className="gd-canvas-section"
                        title="properties.canvas.title"
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

                        {featureFlags["enableHidingOfDataPoints"] && (
                            <DataPointsControl
                                pushData={pushData}
                                properties={properties}
                                isDisabled={controlsDisabled || isDataPointsControlDisabled}
                                showDisabledMessage={isDataPointsControlDisabled}
                            />
                        )}

                        <CheckboxControl
                            valuePath="grid.enabled"
                            labelText="properties.canvas.gridline"
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
}
