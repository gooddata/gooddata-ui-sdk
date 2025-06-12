// (C) 2024 GoodData Corporation

import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import { messages } from "../../../locales.js";
import { RowHeightControl } from "../configurationControls/RowHeightControl.js";
import { VerticalAlignControl } from "../configurationControls/VerticalAlignControl.js";
import { TextWrappingControl } from "../configurationControls/TextWrappingControl.js";
import { ImageControl } from "../configurationControls/ImageControl.js";

export default class RepeaterConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): React.ReactNode {
        const { propertiesMeta, properties, pushData } = this.props;

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderColorSection()}
                    {this.renderInteractionsSection()}
                    <ConfigSection
                        id="canvas_section"
                        title={messages.canvasTitle.id}
                        propertiesMeta={propertiesMeta}
                        properties={properties}
                        pushData={pushData}
                    >
                        <RowHeightControl pushData={pushData} properties={properties} />
                        <VerticalAlignControl pushData={pushData} properties={properties} />
                        <TextWrappingControl pushData={pushData} properties={properties} />
                        <ImageControl pushData={pushData} properties={properties} />
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

    private getBubbleClassNames() {
        return cx("bubble-primary", {
            invisible: true,
        });
    }
}
