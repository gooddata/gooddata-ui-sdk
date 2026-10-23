// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { isEmpty } from "lodash-es";

import { isMeasureMetadataObject, isMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { CancelMode, type IEditMetricContentProps } from "../Content/EditMetricContent.data.js";
import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useOnCloseOrCancel(
    dirty: boolean,
    onCancel: IEditMetricContentProps["onCancel"],
    setMetricToSave: (metric: IMeasureDef | undefined) => void,
    setShowUnsavedChangesConfirmDialog: (value: boolean) => void,
): {
    onCloseCallback: (metric: Partial<IMeasureDef>, valid: boolean) => void;
    onCancelCallback: () => void;
} {
    return useMemo(() => {
        function onCloseCallback(metric: Partial<IMeasureDef>, valid: boolean) {
            if (isEmpty(metric.expression?.trim()) || !dirty) {
                onCancel({ cancelMode: CancelMode.Cross });
                return;
            }

            if (valid && (isMeasureMetadataObjectDefinition(metric) || isMeasureMetadataObject(metric))) {
                setMetricToSave(metric);
            } else {
                setMetricToSave(undefined);
            }

            setShowUnsavedChangesConfirmDialog(true);
        }

        function onCancelCallback() {
            onCancel({ cancelMode: CancelMode.Cancel });
        }

        return { onCloseCallback, onCancelCallback };
    }, [dirty, onCancel, setMetricToSave, setShowUnsavedChangesConfirmDialog]);
}
