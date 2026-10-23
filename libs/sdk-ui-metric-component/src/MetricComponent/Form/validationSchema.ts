// (C) 2021-2026 GoodData Corporation

import { type IntlShape } from "react-intl";
import * as yup from "yup";

import { type IMeasureMetadataObject, type MetricType } from "@gooddata/sdk-model";
import { isCurrencyFormat } from "@gooddata/sdk-ui-kit";

import { addPrefixToId } from "../metric/prefixHelper.js";

import { type MaqlValue, getMaqlValid, getMaqlValue } from "./maqlFieldFunctions.js";
import { type IPrefixes } from "./Prefixes/PrefixesContext.js";

interface IValidationSchemaOptions {
    allowEmptyCurrencyFormat?: boolean;
    /** When false, skip currency format / metricType consistency validation (feature flag off) */
    validateCurrencyMetricType?: boolean;
}

export function getMetricValidationSchema(
    intl: IntlShape,
    locked: boolean,
    otherMetrics = [] as IMeasureMetadataObject[],
    prefixes: IPrefixes,
    options: IValidationSchemaOptions = {},
): yup.AnyObjectSchema {
    let idValidationObject = yup.string().max(255);

    if (!locked) {
        const usedIds = otherMetrics.map((otherMetric) => otherMetric.id);
        const usedPrefixes = prefixes.parents;

        idValidationObject = idValidationObject.test((value, context) => {
            const withPrefix = addPrefixToId(context.parent.prefix, value || "");
            if (usedIds.includes(withPrefix)) {
                return context.createError({
                    path: context.path,
                    message: intl.formatMessage({
                        id: "metricComponent.editMetricForm.idExists",
                    }),
                });
            }
            return true;
        });

        if (usedPrefixes.length > 0) {
            idValidationObject = idValidationObject.test((value, context) => {
                const withPrefix = addPrefixToId(context.parent.prefix, value || "");
                const matchParent = usedPrefixes.find(
                    (parentPrefix) => withPrefix.indexOf(parentPrefix) === 0,
                );
                if (matchParent) {
                    return context.createError({
                        path: context.path,
                        message: intl.formatMessage(
                            {
                                id: "metricComponent.editMetricForm.idMatchParentPrefixName",
                            },
                            {
                                conflict: matchParent,
                            },
                        ),
                    });
                }
                return true;
            });
        }

        idValidationObject = idValidationObject.matches(
            /^(?!\.)[.A-Za-z0-9_-]{0,255}$/,
            intl.formatMessage({ id: "metricComponent.editMetricForm.idInvalid" }),
        );
    }

    return yup
        .object({
            id: idValidationObject,
            title: yup
                .string()
                .max(255)
                .required(intl.formatMessage({ id: "metricComponent.editMetricForm.titleEmpty" })),

            description: yup.string(),

            expression: yup
                .mixed()
                .test((value: MaqlValue, context) => {
                    const val = getMaqlValue(value);
                    return val
                        ? true
                        : context.createError({
                              path: context.path,
                              message: intl.formatMessage({
                                  id: "metricComponent.editMetricForm.expressionEmpty",
                              }),
                              type: "empty",
                          });
                })
                .test((value: MaqlValue, context) => {
                    const valid = getMaqlValid(value);
                    return valid
                        ? true
                        : context.createError({
                              path: context.path,
                              message: intl.formatMessage({
                                  id: "metricComponent.editMetricForm.expressionInvalid",
                              }),
                              type: "syntaxError",
                          });
                }),

            format: yup
                .string()
                .nullable()
                .test("format-metricType-consistency", function (value) {
                    // Skip currency/metricType validation when feature flag is disabled
                    if (!options.validateCurrencyMetricType) {
                        return true;
                    }

                    const metricType = this.parent.metricType as MetricType | undefined;
                    const formatValue = value || "";

                    // Empty format handling (inherit)
                    if (!formatValue) {
                        if (metricType === "CURRENCY") {
                            if (options.allowEmptyCurrencyFormat) {
                                return true;
                            }
                            return this.createError({
                                message: intl.formatMessage({
                                    id: "metricComponent.editMetricForm.formatRequiredForCurrency",
                                }),
                            });
                        }
                        return true;
                    }

                    // If metricType is CURRENCY, format should be a currency format
                    if (metricType === "CURRENCY" && !isCurrencyFormat(formatValue)) {
                        return this.createError({
                            message: intl.formatMessage({
                                id: "metricComponent.editMetricForm.formatNotCurrency",
                            }),
                        });
                    }

                    // If format is a currency format and metricType is explicitly set,
                    // it should be CURRENCY. When metricType is undefined (Unspecified),
                    // allow any format for backward compatibility with legacy currency formats.
                    if (isCurrencyFormat(formatValue) && metricType && metricType !== "CURRENCY") {
                        return this.createError({
                            message: intl.formatMessage({
                                id: "metricComponent.editMetricForm.metricTypeNotCurrency",
                            }),
                        });
                    }

                    return true;
                }),

            metricType: yup.string().oneOf(["UNSPECIFIED", "CURRENCY", undefined]),
        })
        .required();
}
