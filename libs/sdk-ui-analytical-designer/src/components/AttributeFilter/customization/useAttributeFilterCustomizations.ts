// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import {
    type DashboardAttributeFilterSelectionMode,
    type IAttributeElement,
    type IAttributeFilter,
    type ObjRef,
    areObjRefsEqual,
    filterObjRef,
} from "@gooddata/sdk-model";
import { useBackend } from "@gooddata/sdk-ui";
import { type OnChangeCallbackType } from "@gooddata/sdk-ui-filters";

import { type IUpdateAttributeFilterPayload } from "../../../typings/measure_filters.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";
import { AttributeDropdownBody } from "../components/AttributeDropdownBody.js";
import {
    type IAttributeFilterProps,
    type IAttributeFilterStateProps,
    type IItemTitlesMap,
    type ISelectedElements,
} from "../types.js";
import {
    elementsToItemTitlesMap,
    extractTextModeFilterData,
    isDisplayFormSelectVisible,
    mapDecoratedFilterToFilter,
    mapFilterToSelectedItems,
} from "../utils.js";

import { withDisplayFormSelect } from "./withDisplayFormSelect.js";
import { withDropdownButton } from "./withDropdownButton.js";
import { withDropdownClassName } from "./withDropdownClassName.js";
import { withTitleElementsDropdownActionsComponent } from "./withTitleElementsDropdownActionsComponent.js";

function checkIsPrimaryDisplayForm(attribute: ICatalogEntry | undefined, displayFormKey: ObjRef): boolean {
    const displayForms = attribute?.displayForms ?? [];
    const primaryDf = displayForms.find((df) => df?.isPrimary);
    return primaryDf && areObjRefsEqual(primaryDf?.ref, displayFormKey);
}

export const useAttributeFilterCustomizations = (
    props: IAttributeFilterProps & IAttributeFilterStateProps,
) => {
    const {
        autoOpen,
        filter,
        settings,
        useAlternativeDisplayForms,
        availableDisplayForms,
        availableSelectionTypes,
        isUsedByInsight,
        onApply,
        onClose,
        onDisplayFormChange,
        dropdownButtonComponent,
        dropdownBodyComponent,
        elementsSearchBarComponent,
        dropdownClassName,
    } = props;

    const backend = useBackend();
    const original = filter.original as { displayFormRef?: ObjRef; displayAsDisplayFormRef?: ObjRef };
    const isPrimaryDisplayForm = checkIsPrimaryDisplayForm(filter.attribute, original?.displayFormRef);

    const mappedFilter = useMemo(
        () => mapDecoratedFilterToFilter(filter, isPrimaryDisplayForm),
        [filter, isPrimaryDisplayForm],
    );
    const currentDisplayAsLabel: ObjRef = original?.displayAsDisplayFormRef;

    const selectedTitlesRef = useRef<ISelectedElements>({ totalElementsCount: 0, itemTitles: {} });
    const intl = useIntl();

    const onApplyCallback = useCallback(
        (
            filter: IAttributeFilter,
            isInverted: boolean,
            _selectionMode: DashboardAttributeFilterSelectionMode,
            itemTitles: IAttributeElement[] = [],
            displayAsLabel: ObjRef,
        ) => {
            const itemTitlesMap = itemTitles.length
                ? elementsToItemTitlesMap(itemTitles)
                : selectedTitlesRef.current.itemTitles;
            const selectedItems = mapFilterToSelectedItems(filter, itemTitlesMap);

            const textModeFilter = extractTextModeFilterData(filter);

            const payload: IUpdateAttributeFilterPayload = {
                displayFormRef: filterObjRef(filter),
                totalElementsCount: selectedTitlesRef.current.totalElementsCount,
                selectedElements: selectedItems,
                isInverted: isInverted,
                ...(textModeFilter ? { textModeFilter } : {}),
            };
            onApply(payload);
            if (displayAsLabel && !areObjRefsEqual(currentDisplayAsLabel, displayAsLabel)) {
                onDisplayFormChange(displayAsLabel);
            }
        },
        [onApply, onDisplayFormChange, currentDisplayAsLabel],
    );

    const hasTextSelectionTypes = availableSelectionTypes?.some(
        (mode) => mode === "arbitrary" || mode === "match",
    );

    const onChangeCallback: OnChangeCallbackType | undefined = useMemo(() => {
        if (!hasTextSelectionTypes) {
            return undefined;
        }
        return (
            _filter: IAttributeFilter,
            _isInverted: boolean,
            _selectionMode?: DashboardAttributeFilterSelectionMode,
            _itemTitles?: IAttributeElement[],
            displayAsLabel?: ObjRef,
        ) => {
            if (displayAsLabel && !areObjRefsEqual(currentDisplayAsLabel, displayAsLabel)) {
                onDisplayFormChange(displayAsLabel);
            }
        };
    }, [hasTextSelectionTypes, currentDisplayAsLabel, onDisplayFormChange]);

    const CustomStatusBarComponent = useMemo(() => {
        // When text filter modes are enabled, the SDK component provides its own
        // display form handling — skip the custom display form select.
        if (hasTextSelectionTypes) {
            return null;
        }

        if (isDisplayFormSelectVisible(useAlternativeDisplayForms, availableDisplayForms)) {
            return withDisplayFormSelect(onDisplayFormChange);
        }

        return null;
    }, [onDisplayFormChange, useAlternativeDisplayForms, availableDisplayForms, hasTextSelectionTypes]);

    const CustomDropdownButton = useMemo(() => {
        const warningMessage = intl.formatMessage({ id: "filter.isUnusedWarning" });

        return withDropdownButton(
            isUsedByInsight,
            autoOpen,
            warningMessage,
            onClose,
            dropdownButtonComponent,
        );
    }, [autoOpen, isUsedByInsight, dropdownButtonComponent, onClose, intl]);

    const CustomDropdownBody = useMemo(() => {
        if (dropdownBodyComponent) {
            return withDropdownClassName(dropdownBodyComponent, dropdownClassName);
        }
        return withDropdownClassName(AttributeDropdownBody, dropdownClassName);
    }, [dropdownBodyComponent, dropdownClassName]);

    const CustomElementsSearchBarComponent = useMemo(() => {
        if (elementsSearchBarComponent) {
            return elementsSearchBarComponent;
        }
        return null;
    }, [elementsSearchBarComponent]);

    const CustomElementsDropdownActionsComponent = useMemo(() => {
        const onApplyTitles = (itemTitles: IItemTitlesMap, totalElementsCount: number) => {
            selectedTitlesRef.current = { itemTitles, totalElementsCount };
        };

        return withTitleElementsDropdownActionsComponent(onApplyTitles);
    }, []);

    return {
        workspace: settings.workspace,
        backend,
        filter: mappedFilter,
        displayAsDisplayForm: currentDisplayAsLabel,
        onApplyCallback,
        onChangeCallback,
        CustomStatusBarComponent,
        CustomDropdownButton,
        CustomDropdownBody,
        CustomElementsSearchBarComponent,
        CustomElementsDropdownActionsComponent,
    };
};
