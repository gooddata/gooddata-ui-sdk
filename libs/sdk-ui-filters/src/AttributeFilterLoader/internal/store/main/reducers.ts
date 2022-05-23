// (C) 2021-2022 GoodData Corporation
import identity from "lodash/identity";

import { AttributeFilterReducer } from "../state";

const init: AttributeFilterReducer = identity;

/**
 * @internal
 */
export const mainReducers = {
    init,
};
