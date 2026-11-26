// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IdentifierRef, isIdentifierRef, objRefToString } from "@gooddata/sdk-model";
import { ParameterPicker } from "@gooddata/sdk-ui-kit";

import { addParameters } from "../../../model/commands/parameters.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    selectCatalogParameters,
    selectCatalogParametersStatus,
} from "../../../model/store/catalog/catalogSelectors.js";
import { selectActiveParameterRefKeys } from "../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../../model/store/tabs/tabsSelectors.js";

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
    const tabLocalIdentifier = useDashboardSelector(selectActiveOrDefaultTabLocalIdentifier);

    const isLoading = status === "loading" || status === "uninitialized";

    return (
        <ParameterPicker
            parameters={parameters}
            excludedKeys={excludedKeys}
            isLoading={isLoading}
            maxListHeight={PICKER_MAX_LIST_HEIGHT}
            onAdd={(selected) => {
                const refs: IdentifierRef[] = [];
                for (const { ref } of selected) {
                    if (isIdentifierRef(ref) && !excludedKeys.has(objRefToString(ref))) {
                        refs.push(ref);
                    }
                }
                if (refs.length > 0) {
                    dispatch(addParameters(refs, tabLocalIdentifier));
                }
                onAdd?.();
            }}
            onCancel={() => onCancel?.()}
        />
    );
}
