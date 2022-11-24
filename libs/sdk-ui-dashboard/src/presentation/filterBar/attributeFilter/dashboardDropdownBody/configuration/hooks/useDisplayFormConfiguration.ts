// (C) 2022 GoodData Corporation
import { areObjRefsEqual, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { useState, useCallback } from "react";
import {
    useDashboardSelector,
    useDispatchDashboardCommand,
    selectCatalogAttributes,
    IDashboardAttributeFilterDisplayForms,
    setAttributeFilterDisplayForm,
} from "../../../../../../model";

export function useDisplayFormConfiguration(currentFilter: IDashboardAttributeFilter) {
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);

    const changeDisplayFormCommand = useDispatchDashboardCommand(setAttributeFilterDisplayForm);

    const originalDisplayForm = currentFilter.attributeFilter.displayForm;

    const [filterDisplayForms, setFilterDisplayForms] = useState<IDashboardAttributeFilterDisplayForms>(
        () => {
            const currentDisplayForm = currentFilter.attributeFilter.displayForm;

            const availableDisplayForms =
                catalogAttributes.find((attribute) =>
                    attribute.displayForms.some((df) => areObjRefsEqual(df.ref, currentDisplayForm)),
                )?.displayForms || [];

            return {
                selectedDisplayForm: currentDisplayForm,
                availableDisplayForms,
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
            changeDisplayFormCommand(
                currentFilter.attributeFilter.localIdentifier!,
                filterDisplayForms.selectedDisplayForm,
            );
        }
    }, [filterDisplayForms, originalDisplayForm, currentFilter, changeDisplayFormCommand]);

    return {
        onDisplayFormSelect,
        filterDisplayForms,
        displayFormChanged,
        onDisplayFormChange,
    };
}
