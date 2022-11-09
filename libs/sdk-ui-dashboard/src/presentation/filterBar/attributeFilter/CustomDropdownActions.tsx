// (C) 2019-2022 GoodData Corporation
import React from "react";
import { Button } from "@gooddata/sdk-ui-kit";
import { AttributeFilterConfigurationButton, AttributeFilterDeleteButton } from "@gooddata/sdk-ui-filters";
import { ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import {
    selectAllCatalogAttributesMap,
    selectAttributeFilterDisplayFormsMap,
    selectFilterContextAttributeFilters,
    selectIsAlternativeDisplayFormSelectionEnabled,
    selectIsDeleteFilterButtonEnabled,
    selectIsInEditMode,
    selectIsKPIDashboardDependentFiltersEnabled,
    useDashboardSelector,
} from "../../../model";

function useIsConfigButtonVisible(filterDisplayFormRef: ObjRef) {
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const allAttributeFilters = useDashboardSelector(selectFilterContextAttributeFilters);

    const isDependentFiltersEnabled = useDashboardSelector(selectIsKPIDashboardDependentFiltersEnabled);
    const isDisplayFormSelectionEnabled = useDashboardSelector(
        selectIsAlternativeDisplayFormSelectionEnabled,
    );

    const dfMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const filterDisplayForm = dfMap.get(filterDisplayFormRef);
    invariant(filterDisplayForm);

    const attrMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const filterAttribute = attrMap.get(filterDisplayForm.attribute);
    invariant(filterAttribute);

    const canConfigureDependentFilters = isDependentFiltersEnabled && allAttributeFilters.length > 1;
    const canConfigureDisplayForm =
        isDisplayFormSelectionEnabled && filterAttribute.attribute.displayForms.length > 1;

    return isEditMode && (canConfigureDependentFilters || canConfigureDisplayForm);
}

/**
 * @internal
 */
export interface ICustomAttributeFilterDropdownActionsProps {
    onApplyButtonClick: () => void;
    onCancelButtonClick: () => void;
    onConfigurationButtonClick: () => void;
    onDeleteButtonClick: () => void;
    isApplyDisabled?: boolean;
    cancelText: string;
    applyText: string;
    filterDisplayFormRef: ObjRef;
}

/**
 * @internal
 */
export const CustomAttributeFilterDropdownActions: React.FC<ICustomAttributeFilterDropdownActionsProps> = ({
    isApplyDisabled,
    onApplyButtonClick,
    onCancelButtonClick,
    onConfigurationButtonClick,
    onDeleteButtonClick,
    cancelText,
    applyText,
    filterDisplayFormRef,
}) => {
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isDeleteButtonEnabled = useDashboardSelector(selectIsDeleteFilterButtonEnabled);
    const isConfigButtonVisible = useIsConfigButtonVisible(filterDisplayFormRef);

    return (
        <div className="gd-attribute-filter-dropdown-actions__next">
            <div className="gd-attribute-filter-dropdown-actions-left-content__next">
                {isEditMode && isDeleteButtonEnabled ? (
                    <>
                        <AttributeFilterDeleteButton onDelete={onDeleteButtonClick} />
                        <div className="gd-button-separator" />
                    </>
                ) : null}
                {isConfigButtonVisible ? (
                    <AttributeFilterConfigurationButton onConfiguration={onConfigurationButtonClick} />
                ) : null}
            </div>
            <div className="gd-attribute-filter-dropdown-actions-right-content__next">
                <Button
                    className="gd-attribute-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-cancel"
                    onClick={onCancelButtonClick}
                    value={cancelText}
                    title={cancelText}
                />
                <Button
                    disabled={isApplyDisabled}
                    className="gd-attribute-filter-apply-button__next gd-button-action gd-button-small s-apply"
                    onClick={onApplyButtonClick}
                    value={applyText}
                    title={applyText}
                />
            </div>
        </div>
    );
};

/**
 * @internal
 */
export interface ICustomConfigureAttributeFilterDropdownActionsProps {
    onSaveButtonClick: () => void;
    onCancelButtonClick: () => void;
    isSaveDisabled?: boolean;
    cancelText: string;
    saveText: string;
}

/**
 * @internal
 */
export const CustomConfigureAttributeFilterDropdownActions: React.FC<
    ICustomConfigureAttributeFilterDropdownActionsProps
> = ({ isSaveDisabled, onSaveButtonClick, onCancelButtonClick, cancelText, saveText }) => {
    return (
        <div className="gd-attribute-filter-dropdown-actions__next">
            <div className="gd-attribute-filter-dropdown-actions-left-content__next" />
            <div className="gd-attribute-filter-dropdown-actions-right-content__next">
                <Button
                    className="gd-attribute-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-cancel"
                    onClick={onCancelButtonClick}
                    value={cancelText}
                    title={cancelText}
                />
                <Button
                    disabled={isSaveDisabled}
                    className="gd-attribute-filter-apply-button__next gd-button-action gd-button-small s-apply"
                    onClick={onSaveButtonClick}
                    value={saveText}
                    title={saveText}
                />
            </div>
        </div>
    );
};
