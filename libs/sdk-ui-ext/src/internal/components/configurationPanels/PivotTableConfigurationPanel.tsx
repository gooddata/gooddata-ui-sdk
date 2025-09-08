// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { insightHasAttributes, insightHasMeasures, insightMeasures } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import ConfigurationPanelContent from "./ConfigurationPanelContent.js";
import { SectionName } from "./sectionName.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../utils/controlsHelper.js";
import ColumnHeadersPositionControl from "../configurationControls/ColumnHeadersPositionControl.js";
import { ConfigDummySection } from "../configurationControls/ConfigDummySection.js";
import ConfigSection from "../configurationControls/ConfigSection.js";
import MetricsPositionControl from "../configurationControls/MetricsPositionControl.js";

export default class PivotTableConfigurationPanel extends ConfigurationPanelContent {
    protected override isControlDisabled(sectionName?: SectionName): boolean {
        if (sectionName === "interactions.scheduled_exports" || sectionName === "interactions.drill_down") {
            const { insight, isError, isLoading } = this.props;
            // enable if there is at least one attribute (metrics not required)
            return (
                !insight ||
                isError ||
                isLoading ||
                (!insightHasMeasures(insight) && !insightHasAttributes(insight))
            );
        }
        return super.isControlDisabled(sectionName);
    }

    protected renderConfigurationPanel(): React.ReactNode {
        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderInteractionsSection()}
                    {this.renderCanvasSection()}
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

    private renderCanvasSection() {
        const { properties, featureFlags, insight, pushData, isLoading, propertiesMeta, panelConfig } =
            this.props;
        const metricPositionControlsDisabled = this.isPositionControlDisabled();
        const columnHeadersControlsDisabled = this.isColumnHeadersPositionControlDisabled();
        const canvasSection = (
            <ConfigDummySection id="metric_col_header_position_section">
                {featureFlags.enablePivotTableTransposition ? (
                    <MetricsPositionControl
                        isDisabled={metricPositionControlsDisabled}
                        showDisabledMessage={metricPositionControlsDisabled ? !isLoading : false}
                        properties={properties}
                        pushData={pushData}
                    />
                ) : null}
                {featureFlags.enablePivotTableTransposition && featureFlags.enableColumnHeadersPosition ? (
                    <ColumnHeadersPositionControl
                        isDisabled={columnHeadersControlsDisabled}
                        showDisabledMessage={columnHeadersControlsDisabled ? !isLoading : false}
                        properties={properties}
                        pushData={pushData}
                        insight={insight}
                    />
                ) : null}
            </ConfigDummySection>
        );

        return panelConfig.supportsAttributeHierarchies ? (
            <ConfigSection
                id="canvas_section"
                className="gd-table-canvas-section"
                title={messages["canvasTitle"].id}
                propertiesMeta={propertiesMeta}
                pushData={pushData}
            >
                {canvasSection}
            </ConfigSection>
        ) : (
            canvasSection
        );
    }
}
