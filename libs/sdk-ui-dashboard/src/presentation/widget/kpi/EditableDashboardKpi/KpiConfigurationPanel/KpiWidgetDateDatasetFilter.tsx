// (C) 2022 GoodData Corporation
import React, { useEffect, useState } from "react";
import { IKpiWidget, widgetRef } from "@gooddata/sdk-model";

import { DateDatasetFilter, useKpiWidgetRelatedDateDatasets } from "../../../common";
import {
    enableKpiWidgetDateFilter,
    selectKpiDateDatasetAutoOpen,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model";

export const KpiWidgetDateDatasetFilter: React.FC<{
    widget: IKpiWidget;
}> = (props) => {
    const { widget } = props;
    const { status, result } = useKpiWidgetRelatedDateDatasets(props.widget);
    const isKpiDateDatasetAutoOpen = useDashboardSelector(selectKpiDateDatasetAutoOpen);

    const dispatch = useDashboardDispatch();
    const [isWaitingForPreselect, setIsWaitingForPreselect] = useState(isKpiDateDatasetAutoOpen);
    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onError: () => {
            setIsWaitingForPreselect(false);
        },
        onSuccess: () => {
            setIsWaitingForPreselect(false);
        },
    });

    // preselect the first dataset upon loading if the auto open was true
    useEffect(() => {
        if (isKpiDateDatasetAutoOpen && result) {
            const first = result[0];
            if (first) {
                preselectDateDataset(widgetRef(widget), first.dataSet.ref);
            }
        }
    }, [result, isKpiDateDatasetAutoOpen, dispatch, widget]);

    useEffect(() => {
        return () => {
            // once the config panel disappears set the auto-open flag to false so that editing existing KPIs
            // does not have it set to true
            dispatch(uiActions.setKpiDateDatasetAutoOpen(false));
        };
    }, [dispatch]);

    return (
        <div className="gd-kpi-date-dataset-dropdown">
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false} // for KPI date checkbox is always enabled
                isDatasetsLoading={status === "loading" || status === "pending" || isWaitingForPreselect}
                relatedDateDatasets={result}
                shouldPickDateDataset={isKpiDateDatasetAutoOpen}
            />
        </div>
    );
};
