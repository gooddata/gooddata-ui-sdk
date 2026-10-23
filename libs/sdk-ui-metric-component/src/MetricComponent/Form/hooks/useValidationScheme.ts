// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";
import type * as yup from "yup";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { useOtherMetrics } from "../OtherMetrics/useOtherMetrics.js";
import { usePrefixes } from "../Prefixes/usePrefixes.js";
import { getMetricValidationSchema } from "../validationSchema.js";

const empty: IMeasureMetadataObject[] = [];

export interface IValidationSchemeOptions {
    allowEmptyCurrencyFormat?: boolean;
    validateCurrencyMetricType?: boolean;
}

export function useValidationScheme(
    locked?: boolean,
    options: IValidationSchemeOptions = {},
): {
    metricSchema: yup.AnyObjectSchema;
    loading: boolean;
} {
    const intl = useIntl();

    const { otherMetrics = empty, loading } = useOtherMetrics();
    const prefixes = usePrefixes();
    const metricSchema = useMemo(
        () => getMetricValidationSchema(intl, locked || false, otherMetrics, prefixes, options),
        [intl, locked, otherMetrics, prefixes, options],
    );

    return {
        metricSchema,
        loading,
    };
}
