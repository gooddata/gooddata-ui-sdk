// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";

import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import MetricsPositionControl from "../configurationControls/MetricsPositionControl.js";

export default class PivotTableConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): React.ReactNode {
        const { properties, pushData } = this.props;
        const controlsDisabled = this.isPositionControlDisabled();
        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <MetricsPositionControl
                    isDisabled={controlsDisabled}
                    properties={properties}
                    pushData={pushData}
                />
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
            invisible: !this.isPositionControlDisabled(),
        });
    }

    private isPositionControlDisabled() {
        const { insight, isError, isLoading } = this.props;
        return !insight || isError || isLoading;
    }
}
