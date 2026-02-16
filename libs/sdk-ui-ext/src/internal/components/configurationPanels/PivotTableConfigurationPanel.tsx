// (C) 2019-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { insightHasAttributes, insightHasMeasures, insightMeasures } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ConfigurationPanelContent } from "./ConfigurationPanelContent.js";
import { type SectionName } from "./sectionName.js";
import { messages } from "../../../locales.js";
import {
    BUBBLE_ARROW_OFFSET_X,
    BUBBLE_ARROW_OFFSET_Y,
    HIDE_DELAY_DEFAULT,
    SHOW_DELAY_DEFAULT,
} from "../../constants/bubble.js";
import { isSetColumnHeadersPositionToLeftAllowed } from "../../utils/controlsHelper.js";
import { CellsControl } from "../configurationControls/CellsControl.js";
import { ColumnHeadersPositionControl } from "../configurationControls/ColumnHeadersPositionControl.js";
import { ConfigDummySection } from "../configurationControls/ConfigDummySection.js";
import { ConfigSection } from "../configurationControls/ConfigSection.js";
import { GrandTotalsControl } from "../configurationControls/GrandTotalsControl.js";
import { MetricsPositionControl } from "../configurationControls/MetricsPositionControl.js";
import { PagingSection } from "../configurationControls/PagingSection.js";

export class PivotTableConfigurationPanel extends ConfigurationPanelContent {
    protected override isControlDisabled(sectionName?: SectionName): boolean {
        const enableImplicitDrillToUrl = this.props.featureFlags?.enableImplicitDrillToUrl;
        if (
            sectionName === "interactions.scheduled_exports" ||
            sectionName === "interactions.drill_down" ||
            (sectionName === "interactions.drill_into_url" && enableImplicitDrillToUrl)
        ) {
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

    protected renderConfigurationPanel(): ReactNode {
        const { featureFlags } = this.props;
        const enableNewPivotTable = featureFlags?.enableNewPivotTable ?? true;
        const enablePivotTablePagination = featureFlags?.enablePivotTablePagination ?? true;

        return (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                <div>
                    {this.renderInteractionsSection()}
                    {enableNewPivotTable && enablePivotTablePagination ? this.renderPagingSection() : null}
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

        if (!insight) {
            return true;
        }

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
        const { properties, insight, pushData, isLoading, propertiesMeta, panelConfig, featureFlags } =
            this.props;
        const metricPositionControlsDisabled = this.isPositionControlDisabled();
        const columnHeadersControlsDisabled = this.isColumnHeadersPositionControlDisabled();
        const enableNewPivotTable = featureFlags?.enableNewPivotTable ?? true;
        const canvasSection = (
            <ConfigDummySection id="metric_col_header_position_section">
                <MetricsPositionControl
                    isDisabled={metricPositionControlsDisabled}
                    showDisabledMessage={metricPositionControlsDisabled ? !isLoading : false}
                    properties={properties}
                    pushData={pushData}
                />

                <ColumnHeadersPositionControl
                    isDisabled={columnHeadersControlsDisabled}
                    showDisabledMessage={columnHeadersControlsDisabled ? !isLoading : false}
                    properties={properties}
                    pushData={pushData}
                    insight={insight}
                    isLoading={isLoading}
                    enableNewPivotTable={enableNewPivotTable}
                />

                {enableNewPivotTable ? (
                    <>
                        <CellsControl properties={properties} pushData={pushData} isDisabled={isLoading} />
                        <GrandTotalsControl
                            properties={properties}
                            pushData={pushData}
                            isDisabled={isLoading}
                        />
                    </>
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

    private renderPagingSection() {
        const { properties, pushData, isLoading, propertiesMeta } = this.props;

        return (
            <PagingSection
                properties={properties}
                propertiesMeta={propertiesMeta}
                pushData={pushData}
                isDisabled={isLoading}
            />
        );
    }
}
