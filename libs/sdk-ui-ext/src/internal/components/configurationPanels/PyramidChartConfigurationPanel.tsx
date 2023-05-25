// (C) 2019-2023 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import DataLabelsControl from "../configurationControls/DataLabelsControl.js";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import { messages } from "../../../locales.js";

export default class PyramidChartConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): React.ReactNode {
        const { propertiesMeta, properties, pushData } = this.props;
        const controlsDisabled = this.isControlDisabled();

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.renderLegendSection()}
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
                            defaultValue="auto"
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

    private getBubbleClassNames() {
        return cx("bubble-primary", {
            invisible: !this.isControlDisabled(),
        });
    }
}
