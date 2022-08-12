// (C) 2022 GoodData Corporation
import React, { useEffect } from "react";
import invariant from "ts-invariant";

import { isKpiPlaceholderWidget } from "../../../widgets/placeholders/types";
import {
    removeLayoutSection,
    selectLayout,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../model";
import { DashboardItem, DashboardItemContent } from "../../presentationComponents";
import { ConfigurationBubble } from "../common";
import { CustomDashboardWidgetComponent } from "../widget/types";
import { KpiPlaceholderConfigurationPanel } from "./KpiPlaceholderConfigurationPanel";

export const DefaultDashboardKpiPlaceholderWidget: CustomDashboardWidgetComponent = (props) => {
    const { widget, screen } = props;
    invariant(isKpiPlaceholderWidget(widget));

    const dispatch = useDashboardDispatch();

    const layout = useDashboardSelector(selectLayout);
    const section = layout.sections[widget.sectionIndex];

    const { isSelectable, isSelected } = useWidgetSelection(widget.ref);

    useEffect(() => {
        if (!isSelected) {
            dispatch(uiActions.clearWidgetPlaceholder());
            // also try removing the section if it is empty, it means it was just added for this KPI
            if (section.items.length === 0) {
                dispatch(removeLayoutSection(widget.sectionIndex));
            }
        }
    }, [dispatch, isSelected, section.items.length, widget.sectionIndex]);

    return (
        <DashboardItem className="is-selected is-placeholder is-edit-mode" screen={screen}>
            <DashboardItemContent isSelected={isSelected} isSelectable={isSelectable}>
                <ConfigurationBubble>
                    <KpiPlaceholderConfigurationPanel widget={widget} />
                </ConfigurationBubble>
                <div className="kpi-placeholder select-measure" />
            </DashboardItemContent>
        </DashboardItem>
    );
};
