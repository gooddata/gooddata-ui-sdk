// (C) 2019 GoodData Corporation
import React from "react";
import has from "lodash/get";
import { FormattedMessage } from "react-intl";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
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
import { SettingCatalog } from "@gooddata/sdk-backend-spi";

export default class LineChartBasedConfigurationPanel extends BaseChartConfigurationPanel {
    protected renderConfigurationPanel(): React.ReactNode {
        const { gridEnabled, axes } = this.getControlProperties();

        const { featureFlags, insight, properties, propertiesMeta, pushData } = this.props;

        const isNewVisualization = insight.insight.title === "";

        const controlsDisabled = this.isControlDisabled();
        const dataPointsControlDisabled = this.isDataPointsControlDisabled();

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.getBaseChartAxisSection(axes)}
                    {this.renderLegendSection()}
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
                            defaultValue={false}
                        />
                        {featureFlags[SettingCatalog.enableHidingOfDataPoints] && (
                            <DataPointsControl
                                pushData={pushData}
                                properties={properties}
                                isDisabled={controlsDisabled || dataPointsControlDisabled}
                                showDisabledMessage={dataPointsControlDisabled}
                                value={isNewVisualization ? "auto" : undefined}
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

    protected isDataPointsControlDisabled(): boolean {
        const properties = this.props.properties.controls;

        return (
            this.props.type === "combo" &&
            properties.primaryChartType === "column" &&
            properties.secondaryChartType === "column"
        );
    }
}
