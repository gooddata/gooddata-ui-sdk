// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import {
    type IAttributeMetadataObject,
    type IDashboardAttributeFilter,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { setDashboardAttributeFilterConfigDisplayAsLabel } from "../../../../../../model/commands/dashboard.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../../../model/react/useDashboardCommandProcessing.js";
import { selectCatalogAttributes } from "../../../../../../model/store/catalog/catalogSelectors.js";

export function useDisplayFormConfiguration(
    currentFilter: IDashboardAttributeFilter,
    attributes: IAttributeMetadataObject[],
    displayAsLabel?: ObjRef,
) {
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);

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
            changeDisplayAsLabel(currentFilter.attributeFilter.localIdentifier!, selectedDisplayForm);
        }
    }, [selectedDisplayForm, originalDisplayForm, currentFilter, changeDisplayAsLabel]);

    const onConfigurationClose = useCallback(() => {
        setSelectedDisplayForm(originalDisplayForm);
    }, [originalDisplayForm, setSelectedDisplayForm]);

    return {
        onDisplayFormSelect,
        filterDisplayForms,
        displayFormChanged,
        onDisplayFormChange,
        onConfigurationClose,
        displayFormChangeStatus: displayAsLabelChangeStatus,
    };
}
