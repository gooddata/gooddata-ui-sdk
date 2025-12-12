// (C) 2019-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";
import { invariant } from "ts-invariant";

import {
    type DashboardAttributeFilterSelectionMode,
    type IAttributeMetadataObject,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { AttributeFilterConfigurationButton } from "@gooddata/sdk-ui-filters";
import { Button, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { useAttributeFilterDisplayFormFromMap } from "../../../_staging/sharedHooks/useAttributeFilterDisplayFormFromMap.js";
import {
    selectAllCatalogAttributesMap,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsInEditMode,
    useDashboardSelector,
} from "../../../model/index.js";

function useIsConfigButtonVisible(filterDisplayFormRef: ObjRef, attributes?: IAttributeMetadataObject[]) {
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const getAttributeFilterDisplayFormFromMap = useAttributeFilterDisplayFormFromMap();
    const filterDisplayForm = getAttributeFilterDisplayFormFromMap(filterDisplayFormRef);
    invariant(filterDisplayForm);

    const attributesMap = useDashboardSelector(selectAllCatalogAttributesMap);
    if (!attributes) {
        return false;
    }

    const attributeByDisplayForm = attributes?.find((attribute) =>
        areObjRefsEqual(attribute.ref, filterDisplayForm.attribute),
    );

    const filterAttribute = attributesMap.get(filterDisplayForm.attribute) || attributeByDisplayForm;
    invariant(filterAttribute);

    return isEditMode;
}

/**
 * @internal
 */
export interface ICustomAttributeFilterDropdownActionsProps {
    onApplyButtonClick: () => void;
    onCancelButtonClick: () => void;
    onConfigurationButtonClick: () => void;
    isApplyDisabled?: boolean;
    isSelectionChanged?: boolean;
    cancelText: string;
    applyText: string;
    filterDisplayFormRef: ObjRef;
    attributes?: IAttributeMetadataObject[];
    filterSelectionMode?: DashboardAttributeFilterSelectionMode;
}

/**
 * @internal
 */
export function CustomAttributeFilterDropdownActions({
    isApplyDisabled,
    isSelectionChanged,
    onApplyButtonClick,
    onCancelButtonClick,
    onConfigurationButtonClick,
    cancelText,
    applyText,
    filterDisplayFormRef,
    attributes,
    filterSelectionMode,
}: ICustomAttributeFilterDropdownActionsProps) {
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const withoutApply = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const isConfigButtonVisible = useIsConfigButtonVisible(filterDisplayFormRef, attributes);
    const isSingleSelect = filterSelectionMode === "single";

    const tooltipId = useIdPrefixed("save-tooltip");

    if (!isEditMode && isSingleSelect) {
        return null;
    }

    return (
        <div className="gd-attribute-filter-dropdown-actions__next">
            <div className="gd-attribute-filter-dropdown-actions-left-content__next">
                {isConfigButtonVisible ? (
                    <AttributeFilterConfigurationButton onConfiguration={onConfigurationButtonClick} />
                ) : null}
            </div>
            {isSingleSelect ? null : (
                <div className="gd-attribute-filter-dropdown-actions-right-content__next">
                    <Button
                        className="gd-attribute-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-cancel"
                        onClick={onCancelButtonClick}
                        value={cancelText}
                    />
                    {withoutApply ? null : (
                        <UiTooltip
                            id={tooltipId}
                            arrowPlacement={"left"}
                            offset={15}
                            content={<FormattedMessage id={"attributesDropdown.noChanges"} />}
                            triggerBy={["hover", "focus"]}
                            disabled={isSelectionChanged}
                            optimalPlacement
                            anchor={
                                <Button
                                    disabled={isApplyDisabled}
                                    className="gd-attribute-filter-apply-button__next gd-button-action gd-button-small s-apply"
                                    onClick={onApplyButtonClick}
                                    value={applyText}
                                    accessibilityConfig={{
                                        ariaDescribedBy: isSelectionChanged ? undefined : tooltipId,
                                    }}
                                />
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
}

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
export function CustomConfigureAttributeFilterDropdownActions({
    isSaveDisabled,
    onSaveButtonClick,
    onCancelButtonClick,
    cancelText,
    saveText,
}: ICustomConfigureAttributeFilterDropdownActionsProps) {
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
}
