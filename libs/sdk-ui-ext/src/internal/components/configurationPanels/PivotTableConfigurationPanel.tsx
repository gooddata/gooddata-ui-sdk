// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { insightMeasures } from "@gooddata/sdk-model";
import cx from "classnames";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";

import {
    SHOW_DELAY_DEFAULT,
    HIDE_DELAY_DEFAULT,
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
} from "../../constants/bubble.js";
import MetricsPositionControl from "../configurationControls/MetricsPositionControl.js";
import ColumnHeadersPositionControl from "../configurationControls/ColumnHeadersPositionControl.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../utils/controlsHelper.js";

export default class PivotTableConfigurationPanel extends ConfigurationPanelContent {
    protected renderConfigurationPanel(): React.ReactNode {
        const { properties, featureFlags, insight, pushData, isLoading } = this.props;
        const metricPositionControlsDisabled = this.isPositionControlDisabled();
        const columnHeadersControlsDisabled = this.isColumnHeadersPositionControlDisabled();
        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {featureFlags.enablePivotTableTransposition ? (
                        <MetricsPositionControl
                            isDisabled={metricPositionControlsDisabled}
                            showDisabledMessage={metricPositionControlsDisabled ? !isLoading : false}
                            properties={properties}
                            pushData={pushData}
                        />
                    ) : null}
                    {featureFlags.enablePivotTableTransposition &&
                    featureFlags.enableColumnHeadersPosition ? (
                        <ColumnHeadersPositionControl
                            isDisabled={columnHeadersControlsDisabled}
                            showDisabledMessage={columnHeadersControlsDisabled ? !isLoading : false}
                            properties={properties}
                            pushData={pushData}
                            insight={insight}
                        />
                    ) : null}
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
            invisible:
                !this.isPositionControlDisabled() ||
                this.isColumnHeadersPositionControlDisabled() ||
                this.props.isLoading,
        });
    }

    private isPositionControlDisabled() {
        const { insight, isLoading } = this.props;

        const measures = insightMeasures(insight);

        return measures.length === 0 || isLoading;
    }

    private isColumnHeadersPositionControlDisabled() {
        const { insight, isError, isLoading } = this.props;

        const columnHeadersLeftPositionAllowed = insight
            ? isSetColumnHeadersPositionToLeftAllowed(insight)
            : false;

        return !insight || isError || isLoading || !columnHeadersLeftPositionAllowed;
    }
}
