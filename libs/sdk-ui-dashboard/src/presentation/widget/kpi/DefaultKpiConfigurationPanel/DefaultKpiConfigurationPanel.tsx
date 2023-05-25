// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { IKpiWidget, ObjRef, widgetRef, widgetTitle } from "@gooddata/sdk-model";

import {
    changeKpiWidgetMeasure,
    selectAllCatalogMeasuresMap,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { KpiConfigurationPanelCore } from "./KpiConfigurationPanelCore.js";
import { CustomWidgetConfigPanelComponent } from "../../../componentDefinition/index.js";

/**
 * @internal
 */
export const DefaultKpiConfigurationPanel: CustomWidgetConfigPanelComponent<IKpiWidget> = (props) => {
    const { widget } = props;

    const dispatch = useDashboardDispatch();

    const measureRef = widget.kpi.metric;
    const measuresMap = useDashboardSelector(selectAllCatalogMeasuresMap);
    const measureTitle = measuresMap.get(measureRef)?.measure.title;

    const handleMeasureChanged = useCallback(
        (item: ObjRef) => {
            dispatch(
                changeKpiWidgetMeasure(
                    widgetRef(widget),
                    item,
                    // if the title of the widget was the same as the title of the measure
                    // update the widget title to be the title of the newly selected measure
                    measureTitle === widgetTitle(widget) ? "from-measure" : undefined,
                ),
            );
        },
        [dispatch, widget, measureTitle],
    );

    const handlePanelClosed = useCallback(
        () => dispatch(uiActions.setConfigurationPanelOpened(false)),
        [dispatch],
    );

    return (
        <KpiConfigurationPanelCore
            widget={widget}
            onMeasureChange={handleMeasureChanged}
            onClose={handlePanelClosed}
        />
    );
};
