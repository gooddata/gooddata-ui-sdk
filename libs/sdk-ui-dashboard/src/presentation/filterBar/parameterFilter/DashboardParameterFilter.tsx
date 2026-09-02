// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { defineMessages, useIntl } from "react-intl";

import {
    DashboardParameterModeValues,
    type IDashboardParameter,
    type ParameterValue,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    Dropdown,
    ParameterControl,
    ParameterControlButton,
    type ParameterSubmitModeProps,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogParameterByRef } from "../../../model/store/catalog/catalogSelectors.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { tabsActions } from "../../../model/store/tabs/index.js";
import { matchingWorkspaceDefinition } from "../../../model/store/tabs/parameters/parametersHelpers.js";
import {
    selectParameterDisplayValueByRef,
    selectParameterReconciliationByRef,
    selectParameterResetValueByRef,
} from "../../../model/store/tabs/parameters/parametersSelectors.js";
import { DraggableChipSource } from "../../dragAndDrop/DraggableChipSource.js";

const messages = defineMessages({
    resetWarning: { id: "parameter_filter.button.resetWarning.tooltip" },
});

/**
 * @internal
 */
export interface IDashboardParameterFilterProps {
    parameter: IDashboardParameter;
}

/**
 * Renders a chip for a single dashboard parameter.
 *
 * @internal
 */
export function DashboardParameterFilter({ parameter }: IDashboardParameterFilterProps): ReactElement | null {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const workspaceParameter = useDashboardSelector(selectCatalogParameterByRef(parameter.ref));
    const displayValue = useDashboardSelector(selectParameterDisplayValueByRef(parameter.ref));
    const resetValue = useDashboardSelector(selectParameterResetValueByRef(parameter.ref));
    const reconciliation = useDashboardSelector(selectParameterReconciliationByRef(parameter.ref));
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const valueInputId = useIdPrefixed("parameter-value-input");

    if (parameter.mode === DashboardParameterModeValues.HIDDEN || displayValue === undefined) {
        return null;
    }

    const definition = matchingWorkspaceDefinition(parameter, workspaceParameter);
    if (!workspaceParameter || !definition) {
        return null;
    }

    const name = parameter.label ?? workspaceParameter.title;
    const dragItem = { type: "parameter", ref: parameter.ref } as const;
    const warningTooltip = reconciliation === "reset" ? intl.formatMessage(messages.resetWarning) : undefined;

    if (parameter.mode === DashboardParameterModeValues.READONLY) {
        return (
            <DraggableChipSource dragItem={dragItem} canDrag={isInEditMode}>
                <ParameterControlButton
                    name={name}
                    definition={definition}
                    value={displayValue}
                    isActive={false}
                    isDraggable={isInEditMode}
                    warningTooltip={warningTooltip}
                    data-testid={`dashboard-parameter-${objRefToString(parameter.ref)}`}
                />
            </DraggableChipSource>
        );
    }

    const submitModeProps: ParameterSubmitModeProps<ParameterValue> = isApplyAllAtOnceEnabledAndSet
        ? {
              mode: "staged",
              onStage: (value) =>
                  dispatch(tabsActions.setParameterWorkingValue({ ref: parameter.ref, value })),
          }
        : {
              mode: "commit",
              onCommit: (value) =>
                  dispatch(tabsActions.setParameterRuntimeValue({ ref: parameter.ref, value })),
          };

    return (
        <DraggableChipSource dragItem={dragItem} canDrag={isInEditMode}>
            <Dropdown
                autofocusOnOpen
                initialFocus={valueInputId}
                closeOnEscape
                renderButton={({ isOpen, toggleDropdown, dropdownId }) => (
                    <ParameterControlButton
                        name={name}
                        definition={definition}
                        value={displayValue}
                        isActive={isOpen}
                        isDraggable={isInEditMode}
                        dropdownId={dropdownId}
                        onClick={() => toggleDropdown()}
                        warningTooltip={warningTooltip}
                        data-testid={`dashboard-parameter-${objRefToString(parameter.ref)}`}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <ParameterControl
                        name={name}
                        definition={definition}
                        value={displayValue}
                        resetValue={resetValue}
                        inputId={valueInputId}
                        ariaAttributes={ariaAttributes}
                        {...submitModeProps}
                        onClose={closeDropdown}
                    />
                )}
            />
        </DraggableChipSource>
    );
}
