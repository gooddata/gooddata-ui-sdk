// (C) 2022 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";
import {
    useDashboardSelector,
    selectHasCatalogMeasures,
    selectIsWhiteLabeled,
} from "../../../model/index.js";
import { AddKpiWidgetButton, DraggableKpiCreatePanelItem } from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl", offset: { x: -20, y: 0 } }];

/**
 * @internal
 */
export const CreatableKpi: React.FC<ICreatePanelItemComponentProps> = (props) => {
    const { WrapCreatePanelItemWithDragComponent } = props;
    const hasMeasures = useDashboardSelector(selectHasCatalogMeasures);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const disabled = !hasMeasures;
    const tooltip = disabled && (
        <div>
            <FormattedMessage id="addPanel.kpi.tooltip.no_measures" />
            &nbsp;
            {!isWhiteLabeled && (
                <a
                    href="https://help.gooddata.com/pages/viewpage.action?pageId=86794662#DataCataloginAnalyticalDesigner-AdditemstoDataCatalog"
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
            <DraggableKpiCreatePanelItem
                CreatePanelItemComponent={AddKpiWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
                disabled={disabled}
            />
            {tooltip ? <Bubble alignPoints={bubbleAlignPoints}>{tooltip}</Bubble> : null}
        </BubbleHoverTrigger>
    );
};
