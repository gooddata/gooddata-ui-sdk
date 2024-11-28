// (C) 2022-2024 GoodData Corporation
import React, { useCallback, useEffect, useRef } from "react";
import { invariant } from "ts-invariant";

import { isKpiPlaceholderWidget } from "../../../widgets/index.js";
import {
    eagerRemoveNestedLayoutSectionItem,
    selectWidgetPathByRef,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../model/index.js";
import { DashboardItem, DashboardItemContent } from "../../presentationComponents/index.js";
import { ConfigurationBubble } from "../common/index.js";
import { CustomDashboardWidgetComponent } from "../widget/types.js";
import { KpiPlaceholderConfigurationPanel } from "./KpiPlaceholderConfigurationPanel.js";

/**
 * @internal
 */
export const DefaultDashboardKpiPlaceholderWidget: CustomDashboardWidgetComponent = (props) => {
    const { widget, screen } = props;
    invariant(isKpiPlaceholderWidget(widget));

    const dispatch = useDashboardDispatch();
    const layoutPath = useDashboardSelector(selectWidgetPathByRef(widget.ref));

    const { isSelectable, isSelected } = useWidgetSelection(widget.ref);

    // keep information if this widget has been selected in the past
    const wasSelected = useRef(isSelected);
    useEffect(() => {
        if (isSelected) {
            wasSelected.current = true;
        }
    }, [isSelected]);

    useEffect(() => {
        // if the widget was selected in the past and is now not selected, it has just been unselected
        // -> remove its widget placeholder
        if (wasSelected.current && !isSelected) {
            dispatch(eagerRemoveNestedLayoutSectionItem(layoutPath));
        }
    }, [dispatch, isSelected, layoutPath]);

    const onClose = useCallback(() => {
        dispatch(uiActions.setConfigurationPanelOpened(false));
        dispatch(eagerRemoveNestedLayoutSectionItem(layoutPath));
    }, [dispatch, layoutPath]);

    return (
        <DashboardItem className="is-selected is-placeholder is-edit-mode" screen={screen}>
            <DashboardItemContent isSelected={isSelected} isSelectable={isSelectable}>
                <ConfigurationBubble onClose={onClose}>
                    <KpiPlaceholderConfigurationPanel widget={widget} onClose={onClose} />
                </ConfigurationBubble>
                <div className="kpi-placeholder select-measure" />
            </DashboardItemContent>
        </DashboardItem>
    );
};
