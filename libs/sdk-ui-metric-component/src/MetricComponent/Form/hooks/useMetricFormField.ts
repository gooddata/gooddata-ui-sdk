// (C) 2022-2026 GoodData Corporation

import { type FormStatus } from "../../../shared/Form/hooks/useFormStatusInternal.js";
import { useFormDefaults } from "../../../shared/Form/useFormDefaults.js";
import { type FieldStatus, useFormField } from "../../../shared/Form/useFormField.js";
import { useFormStatus } from "../../../shared/Form/useFormStatus.js";
import { emptyMetricWithId } from "../../metric/emptyMetric.js";
import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { type FormMetric, type ValidationSpecialInfo } from "../data.js";

type MetricFormField<T extends keyof FormMetric> = FieldStatus<FormMetric, FormMetric[T]> &
    FormStatus<FormMetric, ValidationSpecialInfo> & { defaultValues: IMeasureDef };

export function useMetricFormField<T extends keyof FormMetric>(field: T): MetricFormField<T> {
    const defaultValue = (emptyMetricWithId as FormMetric)[field];
    const defaultValues = useFormDefaults<IMeasureDef>();
    const formStatus = useFormStatus<FormMetric, ValidationSpecialInfo>();
    const fieldStatus = useFormField<typeof defaultValue, FormMetric>(field, { defaultValue });

    return {
        ...formStatus,
        ...fieldStatus,
        defaultValues,
    };
}
