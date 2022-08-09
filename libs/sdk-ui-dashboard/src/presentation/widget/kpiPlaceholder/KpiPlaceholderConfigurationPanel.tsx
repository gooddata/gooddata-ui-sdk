// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import {
    addSectionItem,
    removeLayoutSection,
    selectAllCatalogMeasuresMap,
    selectLayout,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { getSizeInfo } from "../../../_staging/layout/sizing";

import { KpiConfigurationPanelCore } from "../kpi/EditModeDashboardKpi/KpiConfigurationPanel/KpiConfigurationPanelCore";
import { KpiPlaceholderWidget } from "../../../widgets/placeholders/types";

interface IKpiPlaceholderConfigurationPanelProps {
    widget: KpiPlaceholderWidget;
}

export const KpiPlaceholderConfigurationPanel: React.FC<IKpiPlaceholderConfigurationPanelProps> = (props) => {
    const { widget } = props;

    const dispatch = useDashboardDispatch();

    const settings = useDashboardSelector(selectSettings);
    const measuresMap = useDashboardSelector(selectAllCatalogMeasuresMap);
    const layout = useDashboardSelector(selectLayout);
    const section = layout.sections[widget.sectionIndex];

    const addKpiProcessing = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            dispatch(uiActions.clearWidgetPlaceholder());
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    const handleMeasureChanged = useCallback(
        (measureRef: ObjRef) => {
            const measure = measuresMap.get(measureRef);
            invariant(measure, "Invalid measure when creating a KPI");

            const sizeInfo = getSizeInfo(settings, "kpi");

            addKpiProcessing.run(widget.sectionIndex, widget.itemIndex, {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: sizeInfo.height.default!,
                        gridWidth: sizeInfo.width.default!,
                    },
                },
                widget: {
                    type: "kpi",
                    description: "",
                    drills: [],
                    ignoreDashboardFilters: [],
                    kpi: {
                        comparisonType: "previousPeriod",
                        metric: measureRef,
                        comparisonDirection: "growIsGood",
                    },
                    title: measure.measure.title,
                    dateDataSet: undefined, // the dataset is preselected elsewhere
                },
            });
        },
        [measuresMap, settings, addKpiProcessing, widget.sectionIndex, widget.itemIndex],
    );

    const handlePanelClosed = useCallback(() => {
        dispatch(uiActions.setConfigurationPanelOpened(false));
        dispatch(uiActions.clearWidgetPlaceholder());
        // also try removing the section if it is empty, it means it was just added for this KPI
        if (section.items.length === 0) {
            dispatch(removeLayoutSection(widget.sectionIndex));
        }
    }, [dispatch, section.items.length, widget.sectionIndex]);

    return <KpiConfigurationPanelCore onMeasureChange={handleMeasureChanged} onClose={handlePanelClosed} />;
};
