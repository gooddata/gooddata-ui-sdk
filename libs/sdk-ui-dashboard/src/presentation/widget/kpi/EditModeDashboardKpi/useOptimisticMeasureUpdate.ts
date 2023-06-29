// (C) 2022 GoodData Corporation
import { useEffect, useState } from "react";
import { areObjRefsEqual, IKpiWidget, ObjRef } from "@gooddata/sdk-model";

import {
    useDashboardSelector,
    useDashboardEventsContext,
    isDashboardCommandStarted,
    isDashboardKpiWidgetMeasureChanged,
    DashboardEventHandler,
    isDashboardCommandFailed,
    selectAllCatalogMeasuresMap,
    DashboardCommandStarted,
    ChangeKpiWidgetMeasure,
} from "../../../../model/index.js";

export function useOptimisticMeasureUpdate(kpiWidget: IKpiWidget) {
    // ref of the measure the KPI is being updated to
    const [updatingMeasureRef, setUpdatingMeasureRef] = useState<ObjRef | undefined>();

    const measures = useDashboardSelector(selectAllCatalogMeasuresMap);
    const currentMeasure = measures.get(kpiWidget.kpi.metric);
    const updatingMeasure = updatingMeasureRef && measures.get(updatingMeasureRef);

    const { registerHandler, unregisterHandler } = useDashboardEventsContext();
    useEffect(() => {
        const onMeasureChangingStarted: DashboardEventHandler = {
            eval: (evt: any) => {
                return (
                    isDashboardCommandStarted(evt) &&
                    evt.payload.command.type === "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE" &&
                    areObjRefsEqual(evt.payload.command.payload.ref, kpiWidget.ref)
                );
            },
            handler: (e: DashboardCommandStarted<ChangeKpiWidgetMeasure>) => {
                setUpdatingMeasureRef(e.payload.command.payload.measureRef);
            },
        };
        const onMeasureChangingEnded: DashboardEventHandler = {
            eval: (evt: any) => {
                return (
                    (isDashboardKpiWidgetMeasureChanged(evt) &&
                        areObjRefsEqual(evt.payload.ref, kpiWidget.ref)) ||
                    (isDashboardCommandFailed(evt) &&
                        evt.payload.command.type === "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE" &&
                        areObjRefsEqual(evt.payload.command.payload.ref, kpiWidget.ref))
                );
            },
            handler: () => {
                setUpdatingMeasureRef(undefined);
            },
        };

        registerHandler(onMeasureChangingStarted);
        registerHandler(onMeasureChangingEnded);

        return () => {
            unregisterHandler(onMeasureChangingStarted);
            unregisterHandler(onMeasureChangingEnded);
        };
    }, [kpiWidget.ref, registerHandler, unregisterHandler]);

    const isChangingMeasure = !!updatingMeasureRef;

    // if the current title of the KPI is the same as the title of the current measure, after the update is done,
    // it will take on the title of the new measure, otherwise the title is untouched
    const titleToShow =
        isChangingMeasure && kpiWidget.title === currentMeasure?.measure.title && updatingMeasure
            ? updatingMeasure.measure.title
            : kpiWidget.title;

    return {
        isChangingMeasure,
        titleToShow,
    };
}
