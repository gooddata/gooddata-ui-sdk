// (C) 2022-2024 GoodData Corporation
import {
    areObjRefsEqual,
    IAttributeMetadataObject,
    IDashboardAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { useState, useCallback } from "react";
import {
    useDashboardSelector,
    selectCatalogAttributes,
    IDashboardAttributeFilterDisplayForms,
    setAttributeFilterDisplayForm,
    useDashboardCommandProcessing,
    selectEnableDuplicatedLabelValuesInAttributeFilter,
    setDashboardAttributeFilterConfigDisplayAsLabel,
} from "../../../../../../model/index.js";

export function useDisplayFormConfiguration(
    currentFilter: IDashboardAttributeFilter,
    attributes: IAttributeMetadataObject[],
    displayAsLabel?: ObjRef,
) {
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const enableDuplicatedLabelValuesInAttributeFilter = useDashboardSelector(
        selectEnableDuplicatedLabelValuesInAttributeFilter,
    );

    const { run: changeDisplayForm, status: displayFormChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setAttributeFilterDisplayForm,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.DISPLAY_FORM_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const { run: changeDisplayAsLabel, status: displayAsLabelChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setDashboardAttributeFilterConfigDisplayAsLabel,
        successEvent: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.DISPLAY_AS_LABEL_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const originalDisplayForm = displayAsLabel ?? currentFilter.attributeFilter.displayForm;

    const [filterDisplayForms, setFilterDisplayForms] = useState<IDashboardAttributeFilterDisplayForms>(
        () => {
            const currentDisplayForm = displayAsLabel ?? currentFilter.attributeFilter.displayForm;

            const availableDisplayForms = catalogAttributes.find((attribute) =>
                attribute.displayForms.some((df) => areObjRefsEqual(df.ref, currentDisplayForm)),
            )?.displayForms;

            const attributeAvailableDisplayForms =
                attributes.find((attribute) =>
                    attribute.displayForms.some((df) => areObjRefsEqual(df.ref, currentDisplayForm)),
                )?.displayForms ?? [];

            const result = availableDisplayForms ?? attributeAvailableDisplayForms;

            return {
                selectedDisplayForm: currentDisplayForm,
                availableDisplayForms: result,
            };
        },
    );

    const displayFormChanged = !areObjRefsEqual(originalDisplayForm, filterDisplayForms.selectedDisplayForm);

    const onDisplayFormSelect = useCallback(
        (displayForm: ObjRef) => {
            const updatedDisplayForms = { ...filterDisplayForms };
            updatedDisplayForms.selectedDisplayForm = displayForm;

            setFilterDisplayForms(updatedDisplayForms);
        },
        [filterDisplayForms],
    );

    const onDisplayFormChange = useCallback(() => {
        if (!areObjRefsEqual(originalDisplayForm, filterDisplayForms.selectedDisplayForm)) {
            if (enableDuplicatedLabelValuesInAttributeFilter) {
                changeDisplayAsLabel(
                    currentFilter.attributeFilter.localIdentifier!,
                    filterDisplayForms.selectedDisplayForm,
                );
            } else {
                changeDisplayForm(
                    currentFilter.attributeFilter.localIdentifier!,
                    filterDisplayForms.selectedDisplayForm,
                );
            }
        }
    }, [
        filterDisplayForms,
        originalDisplayForm,
        currentFilter,
        changeDisplayForm,
        enableDuplicatedLabelValuesInAttributeFilter,
        changeDisplayAsLabel,
    ]);

    const onConfigurationClose = useCallback(() => {
        setFilterDisplayForms((old) => ({
            ...old,
            selectedDisplayForm: originalDisplayForm,
        }));
    }, [originalDisplayForm]);

    return {
        onDisplayFormSelect,
        filterDisplayForms,
        displayFormChanged,
        onDisplayFormChange,
        onConfigurationClose,
        displayFormChangeStatus: enableDuplicatedLabelValuesInAttributeFilter
            ? displayAsLabelChangeStatus
            : displayFormChangeStatus,
    };
}
