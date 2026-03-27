// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

export function useAttributeFilterConfigTexts() {
    const intl = useIntl();

    return {
        cancelText: intl.formatMessage({ id: "gs.list.cancel" }),
        closeText: intl.formatMessage({ id: "close" }),
        saveText: intl.formatMessage({ id: "attributesDropdown.save" }),
        applyText: intl.formatMessage({ id: "gs.list.apply" }),
        displayValuesAsText: intl.formatMessage({
            id: "attributesDropdown.displayValuesAs",
        }),
        filterByText: intl.formatMessage({
            id: "attributesDropdown.filterBy",
        }),
        titleText: intl.formatMessage({ id: "attributesDropdown.title" }),
        resetTitleText: intl.formatMessage({
            id: "attributesDropdown.title.reset",
        }),
        selectionTitleText: intl.formatMessage({
            id: "attributesDropdown.selectionMode",
        }),
        multiSelectionOptionText: intl.formatMessage({
            id: "attributesDropdown.selectionMode.multi",
        }),
        multiSelectionOptionTooltip: intl.formatMessage({
            id: "attributesDropdown.selectionMode.multi.tooltip",
        }),
        singleSelectionOptionText: intl.formatMessage({
            id: "attributesDropdown.selectionMode.single",
        }),
        singleSelectionDisabledTooltip: intl.formatMessage({
            id: "attributesDropdown.selectionMode.disabled.tooltip",
        }),
        parentFiltersDisabledTooltip: intl.formatMessage({
            id: "attributesDropdown.parentFilter.disabled.tooltip",
        }),
        modeCategoryTitleText: intl.formatMessage({
            id: "filter.configuration.mode.title",
        }),
        selectionTypeAsText: intl.formatMessage({
            id: "attributesDropdown.selectionType.as",
        }),
        selectionTypeListAndTextText: intl.formatMessage({
            id: "attributesDropdown.selectionType.listOrText",
        }),
        selectionTypeListText: intl.formatMessage({
            id: "attributesDropdown.selectionType.list",
        }),
        selectionTypeTextText: intl.formatMessage({
            id: "attributesDropdown.selectionType.text",
        }),
        selectionTypeListAndTextTooltip: intl.formatMessage({
            id: "attributesDropdown.selectionType.listOrText.tooltip",
        }),
        selectionTypeListTooltip: intl.formatMessage({
            id: "attributesDropdown.selectionType.list.tooltip",
        }),
        selectionTypeTextTooltip: intl.formatMessage({
            id: "attributesDropdown.selectionType.text.tooltip",
        }),
        selectionTypeSingleDisabledTooltip: intl.formatMessage({
            id: "attributesDropdown.selectionType.singleDisabled.tooltip",
        }),
    };
}
