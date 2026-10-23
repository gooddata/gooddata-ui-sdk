// (C) 2021-2026 GoodData Corporation

import { type FormStatus } from "../../../shared/Form/hooks/useFormStatusInternal.js";
import { useFormStatus } from "../../../shared/Form/useFormStatus.js";
import { type IMeasureDef } from "../../metric/metricHelpers.js";
import { type ValidationSpecialInfo } from "../data.js";

export function useMetricFormStatus(): FormStatus<IMeasureDef, ValidationSpecialInfo> {
    return useFormStatus<IMeasureDef, ValidationSpecialInfo>();
}
