// (C) 2022-2023 GoodData Corporation
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
} from "../../../../../../model/index.js";

export function useDisplayFormConfiguration(
    currentFilter: IDashboardAttributeFilter,
    attributes: IAttributeMetadataObject[],
) {
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);

    const { run: changeDisplayForm, status: displayFormChangeStatus } = useDashboardCommandProcessing({
        commandCreator: setAttributeFilterDisplayForm,
        successEvent: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.DISPLAY_FORM_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
    });

    const originalDisplayForm = currentFilter.attributeFilter.displayForm;

    const [filterDisplayForms, setFilterDisplayForms] = useState<IDashboardAttributeFilterDisplayForms>(
        () => {
            const currentDisplayForm = currentFilter.attributeFilter.displayForm;

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
            changeDisplayForm(
                currentFilter.attributeFilter.localIdentifier!,
                filterDisplayForms.selectedDisplayForm,
            );
        }
    }, [filterDisplayForms, originalDisplayForm, currentFilter, changeDisplayForm]);

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
        displayFormChangeStatus,
    };
}
