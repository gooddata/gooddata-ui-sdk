// (C) 2019-2026 GoodData Corporation

import { type ReactNode, memo, useMemo } from "react";

import { capitalize } from "lodash-es";
import { type IntlShape, useIntl } from "react-intl";

import {
    type ISeparators,
    isComparisonConditionOperator,
    isRangeConditionOperator,
} from "@gooddata/sdk-model";
import { createNumberJsFormatter, messages as sdkMessages } from "@gooddata/sdk-ui";
import { UiTooltip, formatNumberWithSeparators, shortenNumber } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import {
    getOperatorTranslationKey,
    getOperatorWithValueTranslationKey,
} from "./helpers/measureValueFilterOperator.js";
import { type MeasureValueFilterOperator } from "./types.js";
import { type IDimensionalityItem } from "./typings.js";

/**
 * Threshold for shortening dimensionality titles.
 * When there are more items than this, the list is shortened with a count indicator.
 */
const DIMENSIONALITY_SHORTEN_THRESHOLD = 3;
const CONDITIONS_SHORTEN_THRESHOLD = 2;

interface IShortenedDimensionality {
    /** The shortened text to display inline */
    shortenedText: string;
    /** The full text for the tooltip (undefined if not shortened) */
    fullText: string | undefined;
    /** The count of additional items (undefined if not shortened) */
    additionalCount: number | undefined;
}

/**
 * Builds shortened dimensionality display with count indicator.
 * Returns shortened text for display and full text for tooltip when there are more items than the threshold.
 */
const buildShortenedDimensionality = (items: IDimensionalityItem[]): IShortenedDimensionality => {
    const titles = items.map((item) => item.title).filter(Boolean);
    if (titles.length === 0) {
        return { shortenedText: "", fullText: undefined, additionalCount: undefined };
    }

    const fullText = titles.join(", ");

    if (titles.length <= DIMENSIONALITY_SHORTEN_THRESHOLD) {
        return { shortenedText: fullText, fullText: undefined, additionalCount: undefined };
    }

    // Shorten to first 3 items with count indicator
    const shortenedTitles = titles.slice(0, DIMENSIONALITY_SHORTEN_THRESHOLD);
    const additionalCount = titles.length - DIMENSIONALITY_SHORTEN_THRESHOLD;
    const shortenedText = `${shortenedTitles.join(", ")}...`;

    return { shortenedText, fullText, additionalCount };
};

type NumberForPreview = number | null | undefined;

const formatNumberForPreview = (
    value: NumberForPreview,
    separators: ISeparators | undefined,
    suffix: string,
    format?: string,
    useShortFormat?: boolean,
): string | undefined => {
    if (value === null || value === undefined || isNaN(value)) {
        return undefined;
    }

    // If useShortFormat is true, use K/M/B shortening for compact display
    if (useShortFormat) {
        const shortened = shortenNumber(value, separators);
        return `${shortened}${suffix}`;
    }

    // If format is provided and suffix is empty (not percentage), use the full metric format
    if (format && !suffix) {
        const formatter = createNumberJsFormatter(separators);
        return formatter(value, format);
    }

    // Otherwise, use simple number formatting with separators and suffix
    const formattedNumber = formatNumberWithSeparators(value, separators);
    return `${formattedNumber}${suffix}`;
};

interface IConditionPreviewParts {
    operator: MeasureValueFilterOperator;
    operatorLabel: string;
    valueLabel?: string;
}

const getConditionPreviewParts = (
    operator: MeasureValueFilterOperator,
    value: NumberForPreview,
    from: NumberForPreview,
    to: NumberForPreview,
    separators: ISeparators | undefined,
    suffix: string,
    format: string | undefined,
    useShortFormat: boolean | undefined,
    intl: IntlShape,
): IConditionPreviewParts | undefined => {
    if (operator === "ALL") {
        // Keep existing capitalization behavior for "All" even if translations are lower-cased.
        const translationKey = getOperatorWithValueTranslationKey(operator);
        if (!translationKey) {
            return undefined;
        }
        const operatorLabel = capitalize(intl.formatMessage({ id: translationKey }));
        return { operator, operatorLabel };
    }
    if (isComparisonConditionOperator(operator)) {
        const translationKey = getOperatorTranslationKey(operator);
        if (!translationKey) {
            return undefined;
        }

        const formattedValue = formatNumberForPreview(value, separators, suffix, format, useShortFormat);
        if (formattedValue === undefined) {
            return undefined;
        }

        const operatorLabel = intl.formatMessage({ id: translationKey });
        return {
            operator,
            operatorLabel,
            valueLabel: formattedValue,
        };
    }
    if (isRangeConditionOperator(operator)) {
        const translationKey = getOperatorTranslationKey(operator);
        if (!translationKey) {
            return undefined;
        }

        const formattedFrom = formatNumberForPreview(from, separators, suffix, format, useShortFormat);
        const formattedTo = formatNumberForPreview(to, separators, suffix, format, useShortFormat);
        if (formattedFrom === undefined || formattedTo === undefined) {
            return undefined;
        }

        const operatorLabel = intl.formatMessage({ id: translationKey });
        return {
            operator,
            operatorLabel,
            valueLabel: intl.formatMessage(
                { id: "mvf.preview.and" },
                { from: formattedFrom, to: formattedTo },
            ),
        };
    }
    return undefined;
};

interface IPreviewSectionProps {
    measureTitle?: string;
    usePercentage?: boolean;
    separators?: ISeparators;
    format?: string;
    /**
     * When true, uses K/M/B shortening for compact display (e.g., "1K" instead of "1,000").
     * When false or undefined, uses full metric format.
     */
    useShortFormat?: boolean;
    dimensionality: IDimensionalityItem[];
    showAllPreview?: boolean;
    conditions: Array<{
        operator: MeasureValueFilterOperator;
        value: {
            value?: number;
            from?: number;
            to?: number;
        };
    }>;
}

export const PreviewSection = memo(function PreviewSection({
    measureTitle,
    usePercentage,
    separators,
    format,
    useShortFormat,
    dimensionality,
    showAllPreview = false,
    conditions,
}: IPreviewSectionProps) {
    const intl = useIntl();

    const textPreview = useMemo((): {
        content: ReactNode;
        tooltipDescriptor:
            | {
                  messageId: string;
                  values: Record<string, string | number | undefined>;
              }
            | undefined;
        tooltipText: string | undefined;
        shouldTruncate: boolean;
    } | null => {
        const suffix = usePercentage ? "%" : "";
        const isAllOperatorSelected = conditions.length > 0 && conditions.every((c) => c.operator === "ALL");

        // Hide "All" operator preview when multiple conditions feature flag is disabled
        if (isAllOperatorSelected && !showAllPreview) {
            return null;
        }

        const conditionParts = conditions
            .map((c) =>
                getConditionPreviewParts(
                    c.operator,
                    c.value.value,
                    c.value.from,
                    c.value.to,
                    separators,
                    suffix,
                    format,
                    useShortFormat,
                    intl,
                ),
            )
            .filter((c): c is IConditionPreviewParts => !!c);

        if (conditionParts.length === 0) {
            return null;
        }
        if (!measureTitle && !isAllOperatorSelected) {
            return null;
        }

        // Determine if we should truncate based on non-ALL conditions count
        const nonAllConditionsCount = conditions.filter((c) => c.operator !== "ALL").length;
        const shouldTruncateConditions = nonAllConditionsCount > CONDITIONS_SHORTEN_THRESHOLD;

        const condition = isAllOperatorSelected
            ? conditionParts[0].operatorLabel
            : (() => {
                  const groupsMap = new Map<MeasureValueFilterOperator, IConditionPreviewParts[]>();
                  const groupOrder: MeasureValueFilterOperator[] = [];

                  for (const part of conditionParts) {
                      const existing = groupsMap.get(part.operator);
                      if (existing) {
                          existing.push(part);
                      } else {
                          groupsMap.set(part.operator, [part]);
                          groupOrder.push(part.operator);
                      }
                  }

                  let result = "";

                  for (const operator of groupOrder) {
                      const parts = groupsMap.get(operator) ?? [];
                      const first = parts[0];
                      if (!first) {
                          continue;
                      }

                      const firstValueText = first.valueLabel ? ` ${first.valueLabel}` : "";
                      const firstText = `${first.operatorLabel}${firstValueText}`;

                      if (result) {
                          result = intl.formatMessage(
                              { id: "mvf.preview.or" },
                              { result1: result, result2: firstText },
                          );
                      } else {
                          result = firstText;
                      }

                      for (const part of parts.slice(1)) {
                          // If the operator is the same as the previous one, don't repeat operator label.
                          // (Safety fallback for unexpected conditions without valueLabel.)
                          const useValueLabel = part.operator !== "ALL" && part.valueLabel;
                          const valuLabelText = useValueLabel ? ` ${part.valueLabel}` : "";
                          const fallbackText = `${part.operatorLabel}${valuLabelText}`;
                          const itemText = useValueLabel ? part.valueLabel : fallbackText;

                          result = intl.formatMessage(
                              { id: "mvf.preview.or" },
                              { result1: result, result2: itemText },
                          );
                      }
                  }

                  return result;
              })();

        const { shortenedText, fullText, additionalCount } = buildShortenedDimensionality(dimensionality);
        const placeholderValues = {
            metric: measureTitle,
            condition,
            dimensionality: shortenedText || undefined,
            count: additionalCount,
            b: (chunk: ReactNode) => <b>{chunk}</b>,
        };

        // Helper to build tooltip descriptor (returns message ID and values for formatting at render time)
        // Uses tooltip-specific messages without <b> tags to avoid ReactNode array parsing
        const buildTooltipDescriptor = (
            tooltipMessageId: string,
        ): {
            messageId: string;
            values: Record<string, string | number | undefined>;
        } => {
            return {
                messageId: tooltipMessageId,
                values: {
                    metric: measureTitle,
                    condition,
                    dimensionality: fullText || shortenedText, // Use full text for tooltip
                    // No 'b' function needed - tooltip messages don't use <b> tags
                },
            };
        };

        if (isAllOperatorSelected) {
            if (dimensionality.length > 0 && shortenedText) {
                if (additionalCount !== undefined) {
                    const contentMessageDescriptor =
                        messages["mvfPreviewFilterWithDimensionalityShortenedNoMetric"];
                    // For tooltip, use plain text variant without count and without <b> tags
                    const tooltipMessageId =
                        messages["mvfPreviewFilterWithDimensionalityNoMetricTooltip"].id!;
                    return {
                        content: intl.formatMessage(contentMessageDescriptor, placeholderValues),
                        tooltipDescriptor: shouldTruncateConditions
                            ? buildTooltipDescriptor(tooltipMessageId)
                            : undefined,
                        tooltipText: shouldTruncateConditions ? undefined : fullText,
                        shouldTruncate: shouldTruncateConditions,
                    };
                }
                const messageDescriptor = messages["mvfPreviewFilterWithDimensionalityNoMetric"];
                const tooltipMessageId = messages["mvfPreviewFilterWithDimensionalityNoMetricTooltip"].id!;
                return {
                    content: intl.formatMessage(messageDescriptor, placeholderValues),
                    tooltipDescriptor: shouldTruncateConditions
                        ? buildTooltipDescriptor(tooltipMessageId)
                        : undefined,
                    tooltipText: shouldTruncateConditions ? undefined : fullText,
                    shouldTruncate: shouldTruncateConditions,
                };
            }

            const messageDescriptor = messages["mvfPreviewFilterWithoutDimensionalityNoMetric"];
            const tooltipMessageId = messages["mvfPreviewFilterWithoutDimensionalityNoMetricTooltip"].id!;
            return {
                content: intl.formatMessage(messageDescriptor, placeholderValues),
                tooltipDescriptor: shouldTruncateConditions
                    ? buildTooltipDescriptor(tooltipMessageId)
                    : undefined,
                tooltipText: shouldTruncateConditions ? undefined : fullText,
                shouldTruncate: shouldTruncateConditions,
            };
        }

        if (dimensionality.length > 0 && shortenedText) {
            // Use shortened variant when there are hidden items
            const contentMessageDescriptor =
                additionalCount === undefined
                    ? sdkMessages["mvfPreviewFilterWithDimensionality"]
                    : sdkMessages["mvfPreviewFilterWithDimensionalityShortened"];
            // For tooltip, use plain text variant without <b> tags
            const tooltipMessageId = messages["mvfPreviewFilterWithDimensionalityTooltip"].id!;
            return {
                content: intl.formatMessage(contentMessageDescriptor, placeholderValues),
                tooltipDescriptor: shouldTruncateConditions
                    ? buildTooltipDescriptor(tooltipMessageId)
                    : undefined,
                tooltipText: shouldTruncateConditions ? undefined : fullText,
                shouldTruncate: shouldTruncateConditions,
            };
        }
        const messageDescriptor = sdkMessages["mvfPreviewFilterWithoutDimensionality"];
        const tooltipMessageId = messages["mvfPreviewFilterWithoutDimensionalityTooltip"].id!;
        return {
            content: intl.formatMessage(messageDescriptor, placeholderValues),
            tooltipDescriptor: shouldTruncateConditions
                ? buildTooltipDescriptor(tooltipMessageId)
                : undefined,
            tooltipText: shouldTruncateConditions ? undefined : fullText,
            shouldTruncate: shouldTruncateConditions,
        };
    }, [
        dimensionality,
        separators,
        usePercentage,
        format,
        useShortFormat,
        measureTitle,
        intl,
        conditions,
        showAllPreview,
    ]);

    if (!textPreview) {
        return null;
    }

    const { content, tooltipDescriptor, tooltipText: plainTooltipText, shouldTruncate } = textPreview;

    // Format tooltip text at render time from descriptor, or use plain text
    // Tooltip messages don't use <b> tags, so formatMessage returns string directly
    const tooltipText = tooltipDescriptor
        ? String(intl.formatMessage({ id: tooltipDescriptor.messageId }, tooltipDescriptor.values))
        : plainTooltipText;

    return (
        <div className="gd-mvf-preview">
            <div className="gd-mvf-preview-header">{intl.formatMessage(sdkMessages["mvfPreviewTitle"])}</div>
            {tooltipText ? (
                <UiTooltip
                    anchor={
                        <div
                            className={
                                shouldTruncate
                                    ? "gd-mvf-preview-content gd-mvf-preview-content--truncated"
                                    : "gd-mvf-preview-content"
                            }
                            data-testid="mvf-preview-text"
                        >
                            {content}
                        </div>
                    }
                    content={<div className="gd-mvf-preview-tooltip-content">{tooltipText}</div>}
                    arrowPlacement="left"
                    triggerBy={["hover"]}
                    optimalPlacement
                    width={shouldTruncate ? undefined : "same-as-anchor"}
                />
            ) : (
                <div className="gd-mvf-preview-content" data-testid="mvf-preview-text">
                    {content}
                </div>
            )}
        </div>
    );
});
