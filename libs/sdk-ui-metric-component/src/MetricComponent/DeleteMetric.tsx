// (C) 2021-2026 GoodData Corporation

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { IntlWrapper } from "../translations/IntlWrapper.js";

import { DeleteMetricConfirmDialog } from "./DeleteMetricConfirmDialog/DeleteMetricConfirmDialog.js";
import { useDeleteCallbacks } from "./hooks/useDeleteCallbacks.js";
import { type IDeleteMetricInfo } from "./metric/deleteInfo.js";
import { type IMeasureDef } from "./metric/metricHelpers.js";

export interface IDeleteMetricProps {
    locale?: string;
    metric: IMeasureDef;
    onDelete?: (metric: IMeasureMetadataObject, info: IDeleteMetricInfo, err: Error | null) => void;
    onClose?: () => void;
    onMetricsChange?: (metric: IMeasureDef) => void;
}

export function DeleteMetric({ locale, metric, onDelete, onClose, onMetricsChange }: IDeleteMetricProps) {
    const { onDeleteHandler } = useDeleteCallbacks(metric, onDelete, onMetricsChange);

    return (
        <IntlWrapper locale={locale}>
            <DeleteMetricConfirmDialog onClose={onClose} onDelete={onDeleteHandler} />
        </IntlWrapper>
    );
}
