// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

import { type ObjRef, objRefToString } from "@gooddata/sdk-model";

import { openReport } from "../../actions/open_actions.js";
import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerOpenProps,
} from "../../embedding/editorHeaderSlotTypes.js";
import {
    enableCatalogSmartSearchResults,
    enableEnhancedInsightPicker,
    enableVisualizationFilteringByTags,
} from "../../selectors/feature_flag_selector.js";
import { canOpenReport, isReportOpeningSelector } from "../../selectors/open_report_selector.js";
import { openReportIdSelector } from "../../selectors/report_selector.js";
import { getTagsConfiguration } from "../../selectors/route_selector.js";
import { getEnabledVisualizationClassesUrls } from "../../services/visualization_class_service.js";
import { type AppDispatch } from "../../store/types.js";

import { useGuardedCallback } from "./editorHeaderContext.js";
import { InsightPickerDialog } from "./InsightPickerDialog.js";
import { VisualizationsDropdown } from "./VisualizationsDropdown.js";

// Tags come as ObjRef (idRef) from the route; the pickers expect their identifiers, and only with the flag on.
const pickerTagsSelector = createSelector(
    enableVisualizationFilteringByTags,
    getTagsConfiguration,
    (isFilteringByTagsEnabled, tagsConfiguration) => ({
        includeTags: isFilteringByTagsEnabled
            ? tagsConfiguration?.includeObjectsWithTags?.map((tag: ObjRef) => objRefToString(tag))
            : undefined,
        excludeTags: isFilteringByTagsEnabled
            ? tagsConfiguration?.excludeObjectsWithTags?.map((tag: ObjRef) => objRefToString(tag))
            : undefined,
    }),
);

const runOpen = (dispatch: AppDispatch, _state: unknown, ref: ObjRef) => dispatch(openReport(ref, false));

export function useOpenProps(context: IAnalyticalDesignerHeaderContext): IAnalyticalDesignerOpenProps {
    const intl = useIntl();
    const isDisabled = !useSelector(canOpenReport);
    const isLoading = useSelector(isReportOpeningSelector);
    const selectedInsightId = useSelector(openReportIdSelector);
    const isEnhancedInsightPickerEnabled = useSelector(enableEnhancedInsightPicker);
    const { includeTags, excludeTags } = useSelector(pickerTagsSelector);
    const enabledVisualizationUrls: string[] = useSelector(getEnabledVisualizationClassesUrls);
    const isSemanticSearchEnabled = useSelector(enableCatalogSmartSearchResults);
    const onOpenInsight = useGuardedCallback<[ObjRef]>(canOpenReport, runOpen);
    const label = intl.formatMessage({ id: "openReportPlaceholder" });

    return useMemo(
        () => ({
            ...context,
            label,
            isDisabled,
            isLoading,
            ...(selectedInsightId ? { selectedInsightId } : {}),
            pickerVariant: isEnhancedInsightPickerEnabled ? "dialog" : "dropdown",
            ...(includeTags ? { includeTags } : {}),
            ...(excludeTags ? { excludeTags } : {}),
            enabledVisualizationUrls,
            isSemanticSearchEnabled,
            onOpenInsight,
        }),
        [
            context,
            label,
            isDisabled,
            isLoading,
            selectedInsightId,
            isEnhancedInsightPickerEnabled,
            includeTags,
            excludeTags,
            enabledVisualizationUrls,
            isSemanticSearchEnabled,
            onOpenInsight,
        ],
    );
}

/**
 * Default of the Open slot: the picker variant the props ask for.
 */
export function DefaultOpen(props: IAnalyticalDesignerOpenProps) {
    return props.pickerVariant === "dialog" ? (
        <InsightPickerDialog {...props} />
    ) : (
        <VisualizationsDropdown {...props} />
    );
}
