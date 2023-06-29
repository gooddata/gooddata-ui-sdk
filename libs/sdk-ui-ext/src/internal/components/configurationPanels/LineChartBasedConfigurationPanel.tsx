// (C) 2019-2023 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import ConfigSection from "../configurationControls/ConfigSection.js";
import CheckboxControl from "../configurationControls/CheckboxControl.js";
import ContinuousLineControl from "../configurationControls/ContinuousLineControl.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";
import DataPointsControl from "../configurationControls/DataPointsControl.js";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import BaseChartConfigurationPanel from "./BaseChartConfigurationPanel.js";
import { IConfigurationPanelContentProps } from "./ConfigurationPanelContent.js";
import { messages } from "../../../locales.js";

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
        const { isDataPointsControlDisabled, isContinuousLineControlDisabled } = panelConfig;

        const controlsDisabled = this.isControlDisabled();
        const continuousLineEnabled = properties?.controls?.continuousLine?.enabled;

        const shouldContinuousLineControlDisabled = controlsDisabled || isContinuousLineControlDisabled;

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.getBaseChartAxisSection(axes)}
                    {this.renderLegendSection()}
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

                        {featureFlags["enableHidingOfDataPoints"] ? (
                            <DataPointsControl
                                pushData={pushData}
                                properties={properties}
                                isDisabled={controlsDisabled || isDataPointsControlDisabled}
                                showDisabledMessage={isDataPointsControlDisabled}
                            />
                        ) : null}

                        <CheckboxControl
                            valuePath="grid.enabled"
                            labelText={messages.canvasGridLine.id}
                            properties={properties}
                            checked={gridEnabled}
                            disabled={controlsDisabled}
                            pushData={pushData}
                        />

                        <ContinuousLineControl
                            properties={properties}
                            checked={!shouldContinuousLineControlDisabled ? continuousLineEnabled : false}
                            disabled={shouldContinuousLineControlDisabled}
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
