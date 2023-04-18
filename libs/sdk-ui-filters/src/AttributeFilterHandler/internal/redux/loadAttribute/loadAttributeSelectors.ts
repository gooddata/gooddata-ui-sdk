// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { IAttributeMetadataObject } from "@gooddata/sdk-model";

import { selectState } from "../common/selectors";
import { FilterSelector } from "../common/types";
import { AsyncOperationStatus } from "../../../../AttributeFilterHandler/types";

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
