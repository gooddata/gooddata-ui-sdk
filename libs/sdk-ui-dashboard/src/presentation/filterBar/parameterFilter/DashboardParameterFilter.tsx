// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import {
    DashboardParameterModeValues,
    type IDashboardParameter,
    isNumberParameterDefinition,
    objRefToString,
} from "@gooddata/sdk-model";
import { Dropdown, ParameterControlButton, ParameterControlDropdown } from "@gooddata/sdk-ui-kit";

import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogParameterByRef } from "../../../model/store/catalog/catalogSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { tabsActions } from "../../../model/store/tabs/index.js";
import { selectParameterRuntimeOverrideByRef } from "../../../model/store/tabs/parameters/parametersSelectors.js";
import { DraggableChipSource } from "../../dragAndDrop/DraggableChipSource.js";

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
    const dispatch = useDashboardDispatch();
    const workspaceParameter = useDashboardSelector(selectCatalogParameterByRef(parameter.ref));
    const runtimeOverride = useDashboardSelector(selectParameterRuntimeOverrideByRef(parameter.ref));
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    if (parameter.mode === DashboardParameterModeValues.HIDDEN || runtimeOverride === undefined) {
        return null;
    }

    if (!workspaceParameter || !isNumberParameterDefinition(workspaceParameter.definition)) {
        return null;
    }

    const name = parameter.label ?? workspaceParameter.title;
    const { constraints } = workspaceParameter.definition;
    const dragItem = { type: "parameter", ref: parameter.ref } as const;

    if (parameter.mode === DashboardParameterModeValues.READONLY) {
        return (
            <DraggableChipSource dragItem={dragItem} canDrag={isInEditMode}>
                <ParameterControlButton
                    name={name}
                    value={runtimeOverride}
                    isActive={false}
                    isDraggable={isInEditMode}
                    data-testid={`dashboard-parameter-${objRefToString(parameter.ref)}`}
                />
            </DraggableChipSource>
        );
    }

    return (
        <DraggableChipSource dragItem={dragItem} canDrag={isInEditMode}>
            <Dropdown
                renderButton={({ isOpen, toggleDropdown }) => (
                    <ParameterControlButton
                        name={name}
                        value={runtimeOverride}
                        isActive={isOpen}
                        isDraggable={isInEditMode}
                        onClick={() => toggleDropdown()}
                        data-testid={`dashboard-parameter-${objRefToString(parameter.ref)}`}
                    />
                )}
                renderBody={({ closeDropdown }) => (
                    <ParameterControlDropdown
                        name={name}
                        value={runtimeOverride}
                        constraints={constraints}
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
