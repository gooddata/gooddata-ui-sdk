// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { addFilterMessages, mvfMessages, sharedMessages } from "./messages.js";
import { type CatalogItemPickerType } from "./types.js";
import { type ICatalogItemPickerLabels } from "./useCatalogItemPickerListboxItems.js";

interface IUseCatalogItemPickerLabelsParams {
    variant: "mvf" | "addFilter";
    effectiveType: CatalogItemPickerType;
}

/**
 * Hook to compute localized labels for the catalog item picker based on variant and type.
 *
 * @internal
 */
export function useCatalogItemPickerLabels({
    variant,
    effectiveType,
}: IUseCatalogItemPickerLabelsParams): ICatalogItemPickerLabels {
    const intl = useIntl();

    const sharedLabels = useMemo(
        () => ({
            cancelLabel: intl.formatMessage(sharedMessages.cancel),
            backAriaLabel: intl.formatMessage(sharedMessages.backAriaLabel),
            closeAriaLabel: intl.formatMessage(sharedMessages.closeAriaLabel),
            searchPlaceholder: intl.formatMessage(sharedMessages.searchPlaceholder),
            searchAriaLabel: intl.formatMessage(sharedMessages.searchAriaLabel),
            ungroupedTitle: intl.formatMessage(sharedMessages.ungroupedTitle),
        }),
        [intl],
    );

    return useMemo<ICatalogItemPickerLabels>(() => {
        if (variant === "addFilter") {
            const titleMessage =
                effectiveType === "metric"
                    ? addFilterMessages.titleMetric
                    : effectiveType === "date"
                      ? addFilterMessages.titleDate
                      : addFilterMessages.titleAttribute;
            const addTooltipMessage =
                effectiveType === "metric"
                    ? addFilterMessages.addTooltipMetric
                    : addFilterMessages.addTooltipAttribute;
            return {
                ...sharedLabels,
                title: intl.formatMessage(titleMessage),
                emptyNoResults: intl.formatMessage(addFilterMessages.emptyNoResults),
                emptyNoItems: intl.formatMessage(addFilterMessages.emptyNoItems),
                fromVisualization: intl.formatMessage(addFilterMessages.fromVisualization),
                addLabel: intl.formatMessage(addFilterMessages.addButton),
                addTooltip: intl.formatMessage(addTooltipMessage),
                tabLabels: {
                    attribute: intl.formatMessage(addFilterMessages.tabAttribute),
                    metric: intl.formatMessage(addFilterMessages.tabMetric),
                    date: intl.formatMessage(addFilterMessages.tabDate),
                },
            };
        }

        return {
            ...sharedLabels,
            title: intl.formatMessage(mvfMessages.title),
            emptyNoResults: intl.formatMessage(mvfMessages.emptyNoResults),
            emptyNoItems: intl.formatMessage(mvfMessages.emptyNoItems),
            fromVisualization: intl.formatMessage(mvfMessages.fromVisualization),
            dateAsLabel: intl.formatMessage(mvfMessages.dateAsLabel),
            tabLabels: {
                attribute: intl.formatMessage(mvfMessages.tabAttribute),
                date: intl.formatMessage(mvfMessages.tabDate),
            },
        };
    }, [effectiveType, intl, sharedLabels, variant]);
}
