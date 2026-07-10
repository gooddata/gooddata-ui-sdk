// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { defineMessages, useIntl } from "react-intl";

import {
    DashboardParameterModeValues,
    type IDashboardParameter,
    isNumberParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    Dropdown,
    ParameterControlButton,
    ParameterControlDropdown,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogParameterByRef } from "../../../model/store/catalog/catalogSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { tabsActions } from "../../../model/store/tabs/index.js";
import {
    selectParameterReconciliationByRef,
    selectParameterResetValueByRef,
    selectParameterRuntimeOverrideByRef,
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
    const runtimeOverride = useDashboardSelector(selectParameterRuntimeOverrideByRef(parameter.ref));
    const resetValue = useDashboardSelector(selectParameterResetValueByRef(parameter.ref));
    const reconciliation = useDashboardSelector(selectParameterReconciliationByRef(parameter.ref));
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const valueInputId = useIdPrefixed("parameter-value-input");

    if (parameter.mode === DashboardParameterModeValues.HIDDEN || runtimeOverride === undefined) {
        return null;
    }

    if (!workspaceParameter || !isNumberParameterDefinition(workspaceParameter.definition)) {
        return null;
    }

    const name = parameter.label ?? workspaceParameter.title;
    const { constraints } = workspaceParameter.definition;
    const dragItem = { type: "parameter", ref: parameter.ref } as const;
    const warningTooltip = reconciliation === "reset" ? intl.formatMessage(messages.resetWarning) : undefined;

    if (parameter.mode === DashboardParameterModeValues.READONLY) {
        return (
            <DraggableChipSource dragItem={dragItem} canDrag={isInEditMode}>
                <ParameterControlButton
                    name={name}
                    value={runtimeOverride}
                    isActive={false}
                    isDraggable={isInEditMode}
                    warningTooltip={warningTooltip}
                    data-testid={`dashboard-parameter-${objRefToString(parameter.ref)}`}
                />
            </DraggableChipSource>
        );
    }

    return (
        <DraggableChipSource dragItem={dragItem} canDrag={isInEditMode}>
            <Dropdown
                autofocusOnOpen
                initialFocus={valueInputId}
                closeOnEscape
                renderButton={({ isOpen, toggleDropdown, dropdownId }) => (
                    <ParameterControlButton
                        name={name}
                        value={runtimeOverride}
                        isActive={isOpen}
                        isDraggable={isInEditMode}
                        dropdownId={dropdownId}
                        onClick={() => toggleDropdown()}
                        warningTooltip={warningTooltip}
                        data-testid={`dashboard-parameter-${objRefToString(parameter.ref)}`}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <ParameterControlDropdown
                        name={name}
                        value={runtimeOverride}
                        resetValue={resetValue}
                        constraints={constraints}
                        inputId={valueInputId}
                        ariaAttributes={ariaAttributes}
                        onApply={(value) => {
                            dispatch(tabsActions.setParameterRuntimeValue({ ref: parameter.ref, value }));
                            closeDropdown();
                        }}
                        onCancel={closeDropdown}
                    />
                )}
            />
        </DraggableChipSource>
    );
}
