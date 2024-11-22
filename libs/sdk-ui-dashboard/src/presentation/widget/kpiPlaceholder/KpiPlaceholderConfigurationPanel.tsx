// (C) 2022-2024 GoodData Corporation
import React, { useCallback } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";

import {
    replaceNestedLayoutSectionItem,
    selectAllCatalogMeasuresMap,
    selectSettings,
    selectWidgetPathByRef,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { getSizeInfo } from "../../../_staging/layout/sizing.js";

import { KpiConfigurationPanelCore } from "../kpi/DefaultKpiConfigurationPanel/KpiConfigurationPanelCore.js";
import { KpiPlaceholderWidget } from "../../../widgets/index.js";

interface IKpiPlaceholderConfigurationPanelProps {
    widget: KpiPlaceholderWidget;
    onClose: () => void;
}

export const KpiPlaceholderConfigurationPanel: React.FC<IKpiPlaceholderConfigurationPanelProps> = (props) => {
    const { widget, onClose } = props;

    const dispatch = useDashboardDispatch();

    const settings = useDashboardSelector(selectSettings);
    const measuresMap = useDashboardSelector(selectAllCatalogMeasuresMap);
    const layoutPath = useDashboardSelector(selectWidgetPathByRef(widget.ref));

    const replaceKpiProcessing = useDashboardCommandProcessing({
        commandCreator: replaceNestedLayoutSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        onSuccess: (event) => {
            const ref = event.payload.items[0].widget!.ref;

            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    const handleMeasureChanged = useCallback(
        (measureRef: ObjRef) => {
            const measure = measuresMap.get(measureRef);
            invariant(measure, "Invalid measure when creating a KPI");

            const sizeInfo = getSizeInfo(settings, "kpi");

            // replace the placeholder that is already in place
            replaceKpiProcessing.run(layoutPath, {
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
        [measuresMap, settings, replaceKpiProcessing, layoutPath],
    );

    return <KpiConfigurationPanelCore onMeasureChange={handleMeasureChanged} onClose={onClose} />;
};
