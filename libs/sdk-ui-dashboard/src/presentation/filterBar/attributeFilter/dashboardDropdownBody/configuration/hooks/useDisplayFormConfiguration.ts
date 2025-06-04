// (C) 2022-2025 GoodData Corporation
import {
    areObjRefsEqual,
    IAttributeMetadataObject,
    IDashboardAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { useState, useCallback, useMemo } from "react";
import {
    useDashboardSelector,
    selectCatalogAttributes,
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

    const [selectedDisplayForm, setSelectedDisplayForm] = useState<ObjRef>(
        () => displayAsLabel ?? currentFilter.attributeFilter.displayForm,
    );

    const availableDisplayForms = useMemo(() => {
        const availableDfs = catalogAttributes.find((attribute) =>
            attribute.displayForms.some((df) => areObjRefsEqual(df.ref, selectedDisplayForm)),
        )?.displayForms;

        const attributeAvailableDisplayForms =
            attributes.find((attribute) =>
                attribute.displayForms.some((df) => areObjRefsEqual(df.ref, selectedDisplayForm)),
            )?.displayForms ?? [];

        return availableDfs ?? attributeAvailableDisplayForms;
    }, [catalogAttributes, attributes, selectedDisplayForm]);

    const filterDisplayForms = useMemo(() => {
        return {
            selectedDisplayForm,
            availableDisplayForms,
        };
    }, [selectedDisplayForm, availableDisplayForms]);

    const displayFormChanged = !areObjRefsEqual(originalDisplayForm, filterDisplayForms.selectedDisplayForm);

    const onDisplayFormSelect = useCallback(
        (displayForm: ObjRef) => {
            setSelectedDisplayForm(displayForm);
        },
        [setSelectedDisplayForm],
    );

    const onDisplayFormChange = useCallback(() => {
        if (!areObjRefsEqual(originalDisplayForm, selectedDisplayForm)) {
            if (enableDuplicatedLabelValuesInAttributeFilter) {
                changeDisplayAsLabel(currentFilter.attributeFilter.localIdentifier!, selectedDisplayForm);
            } else {
                changeDisplayForm(currentFilter.attributeFilter.localIdentifier!, selectedDisplayForm);
            }
        }
    }, [
        selectedDisplayForm,
        originalDisplayForm,
        currentFilter,
        changeDisplayForm,
        enableDuplicatedLabelValuesInAttributeFilter,
        changeDisplayAsLabel,
    ]);

    const onConfigurationClose = useCallback(() => {
        setSelectedDisplayForm(originalDisplayForm);
    }, [originalDisplayForm, setSelectedDisplayForm]);

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
