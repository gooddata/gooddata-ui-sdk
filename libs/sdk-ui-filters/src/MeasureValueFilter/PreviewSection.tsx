// (C) 2019-2026 GoodData Corporation

import { type ReactNode, memo, useMemo } from "react";

import { type IntlShape, useIntl } from "react-intl";

import {
    type ISeparators,
    isComparisonConditionOperator,
    isRangeConditionOperator,
} from "@gooddata/sdk-model";
import { messages } from "@gooddata/sdk-ui";
import { UiTooltip, formatNumberWithSeparators } from "@gooddata/sdk-ui-kit";

import { getOperatorWithValueTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { type MeasureValueFilterOperator } from "./types.js";
import { type IDimensionalityItem } from "./typings.js";

/**
 * Threshold for shortening dimensionality titles.
 * When there are more items than this, the list is shortened with a count indicator.
 */
const DIMENSIONALITY_SHORTEN_THRESHOLD = 3;

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
): string | undefined => {
    if (value === null || value === undefined || isNaN(value)) {
        return undefined;
    }
    const formattedNumber = formatNumberWithSeparators(value, separators);
    return `${formattedNumber}${suffix}`;
};

const getConditionLabel = (
    operator: MeasureValueFilterOperator,
    value: NumberForPreview,
    from: NumberForPreview,
    to: NumberForPreview,
    separators: ISeparators | undefined,
    suffix: string,
    intl: IntlShape,
): string | undefined => {
    if (isComparisonConditionOperator(operator)) {
        const formattedValue = formatNumberForPreview(value, separators, suffix);
        return formattedValue == undefined
            ? undefined
            : intl.formatMessage(
                  { id: getOperatorWithValueTranslationKey(operator) },
                  { value: formattedValue },
              );
    }
    if (isRangeConditionOperator(operator)) {
        const formattedFrom = formatNumberForPreview(from, separators, suffix);
        const formattedTo = formatNumberForPreview(to, separators, suffix);
        return formattedFrom === undefined || formattedTo === undefined
            ? undefined
            : intl.formatMessage(
                  { id: getOperatorWithValueTranslationKey(operator) },
                  {
                      from: formattedFrom,
                      to: formattedTo,
                  },
              );
    }
    return undefined;
};

interface IPreviewSectionProps {
    operator: MeasureValueFilterOperator;
    measureTitle?: string;
    usePercentage?: boolean;
    separators?: ISeparators;
    dimensionality: IDimensionalityItem[];
    value: number | undefined;
    from: number | undefined;
    to: number | undefined;
}

export const PreviewSection = memo(function PreviewSection({
    operator,
    measureTitle,
    usePercentage,
    separators,
    dimensionality,
    value,
    from,
    to,
}: IPreviewSectionProps) {
    const intl = useIntl();

    const textPreview = useMemo((): {
        content: ReactNode;
        tooltip: string | undefined;
    } | null => {
        if (operator === "ALL") {
            return null;
        }
        const suffix = usePercentage ? "%" : "";
        const condition = getConditionLabel(operator, value, from, to, separators, suffix, intl);
        if (!condition) {
            return null;
        }
        if (!measureTitle) {
            return null;
        }
        const { shortenedText, fullText, additionalCount } = buildShortenedDimensionality(dimensionality);
        const placeholderValues = {
            metric: measureTitle,
            condition,
            dimensionality: shortenedText || undefined,
            count: additionalCount,
            b: (chunk: ReactNode) => <b>{chunk}</b>,
        };
        if (dimensionality.length > 0 && shortenedText) {
            // Use shortened variant when there are hidden items
            const message =
                additionalCount === undefined
                    ? messages["mvfPreviewFilterWithDimensionality"]
                    : messages["mvfPreviewFilterWithDimensionalityShortened"];
            return { content: intl.formatMessage(message, placeholderValues), tooltip: fullText };
        }
        return {
            content: intl.formatMessage(messages["mvfPreviewFilterWithoutDimensionality"], placeholderValues),
            tooltip: fullText,
        };
    }, [operator, dimensionality, separators, usePercentage, measureTitle, intl, value, from, to]);

    if (!textPreview) {
        return null;
    }

    return (
        <div className="gd-mvf-preview">
            <div className="gd-mvf-preview-header">{intl.formatMessage(messages["mvfPreviewTitle"])}</div>
            {textPreview.tooltip ? (
                <UiTooltip
                    anchor={
                        <div className="gd-mvf-preview-content" data-testid="mvf-preview-text">
                            {textPreview.content}
                        </div>
                    }
                    content={textPreview.tooltip}
                    arrowPlacement="left"
                    triggerBy={["hover"]}
                    width="same-as-anchor"
                    optimalPlacement
                />
            ) : (
                <div className="gd-mvf-preview-content" data-testid="mvf-preview-text">
                    {textPreview.content}
                </div>
            )}
        </div>
    );
});
