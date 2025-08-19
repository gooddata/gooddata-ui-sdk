// (C) 2021-2025 GoodData Corporation
// in current version of @reduxjs/toolkit esm export are not defined
// we need direct import from esm module otherwise import ar not node compatible
// https://github.com/reduxjs/redux-toolkit/issues/1960
import { createSelector } from "@reduxjs/toolkit";

import { IAttributeMetadataObject } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { AsyncOperationStatus } from "../../../types/index.js";
import { selectState } from "../common/selectors.js";
import { FilterSelector } from "../common/types.js";

/**
 * @internal
 */
export const selectAttribute: FilterSelector<IAttributeMetadataObject> = createSelector(
    selectState,
    (state) => state.attribute.data,
);

/**
 * @internal
 */
export const selectAttributeStatus: FilterSelector<AsyncOperationStatus> = createSelector(
    selectState,
    (state) => state.attribute.status,
);

/**
 * @internal
 */
export const selectAttributeError: FilterSelector<GoodDataSdkError> = createSelector(
    selectState,
    (state) => state.attribute.error,
);
