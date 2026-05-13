// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { DashboardParameterModeValues, isIdentifierRef } from "@gooddata/sdk-model";
import { ParameterPicker } from "@gooddata/sdk-ui-kit";

import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectCatalogParameters,
    selectCatalogParametersStatus,
} from "../../../model/store/catalog/catalogSelectors.js";
import { tabsActions } from "../../../model/store/tabs/index.js";
import { selectActiveParameterRefKeys } from "../../../model/store/tabs/parameters/parametersSelectors.js";

const PICKER_MAX_LIST_HEIGHT = 320;

/**
 * @internal
 */
export interface IDashboardParameterPickerProps {
    onAdd?: () => void;
    onCancel?: () => void;
}

/**
 * Connected wrapper around sdk-ui-kit's `ParameterPicker`.
 *
 * @internal
 */
export function DashboardParameterPicker({ onAdd, onCancel }: IDashboardParameterPickerProps): ReactElement {
    const dispatch = useDashboardDispatch();
    const parameters = useDashboardSelector(selectCatalogParameters);
    const status = useDashboardSelector(selectCatalogParametersStatus);
    const excludedKeys = useDashboardSelector(selectActiveParameterRefKeys);

    const isLoading = status === "loading" || status === "uninitialized";

    return (
        <ParameterPicker
            parameters={parameters}
            excludedKeys={excludedKeys}
            isLoading={isLoading}
            maxListHeight={PICKER_MAX_LIST_HEIGHT}
            onAdd={(selected) => {
                for (const { ref, definition } of selected) {
                    if (!isIdentifierRef(ref)) {
                        continue;
                    }
                    dispatch(
                        tabsActions.addParameter({
                            parameter: {
                                ref,
                                parameterType: "NUMBER",
                                mode: DashboardParameterModeValues.ACTIVE,
                            },
                            workspaceDefault: definition.defaultValue,
                        }),
                    );
                }
                onAdd?.();
            }}
            onCancel={() => onCancel?.()}
        />
    );
}
