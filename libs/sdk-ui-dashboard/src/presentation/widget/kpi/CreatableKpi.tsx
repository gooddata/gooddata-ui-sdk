// (C) 2022 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import { useDashboardSelector, selectHasCatalogMeasures, selectIsWhiteLabeled } from "../../../model";
import { AddKpiWidgetButton, DraggableKpiCreatePanelItem } from "../../dragAndDrop";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl", offset: { x: -20, y: 0 } }];

/**
 * @internal
 */
export const CreatableKpi: React.FC = () => {
    const hasMeasures = useDashboardSelector(selectHasCatalogMeasures);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const disabled = !hasMeasures;
    const tooltip = disabled && (
        <div>
            <FormattedMessage id="addPanel.kpi.tooltip.no_measures" />
            &nbsp;
            {!isWhiteLabeled && (
                <a
                    href="https://help.gooddata.com/display/doc/Data+Catalog+in+Analytical+Designer#DataCataloginAnalyticalDesigner-AdditemstoDataCatalog"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="s-add-kpi-tooltip-link"
                >
                    <FormattedMessage id="addPanel.kpi.tooltip.no_measures.link" />
                </a>
            )}
        </div>
    );

    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-kpi-bubble-trigger">
            <DraggableKpiCreatePanelItem CreatePanelItemComponent={AddKpiWidgetButton} disabled={disabled} />
            {tooltip && <Bubble alignPoints={bubbleAlignPoints}>{tooltip}</Bubble>}
        </BubbleHoverTrigger>
    );
};
