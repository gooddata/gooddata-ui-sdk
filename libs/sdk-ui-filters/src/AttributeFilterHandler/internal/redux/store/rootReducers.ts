// (C) 2021-2022 GoodData Corporation
import { initReducers } from "../init/initReducers.js";
import { loadAttributeReducers } from "../loadAttribute/loadAttributeReducers.js";
import { loadCustomElementsReducers } from "../loadCustomElements/loadCustomElementsReducers.js";
import { loadInitialElementsPageReducers } from "../loadInitialElementsPage/loadInitialElementsPageReducers.js";
import { loadNextElementsPageReducers } from "../loadNextElementsPage/loadNextElementsPageReducers.js";
import { selectionReducers } from "../selection/selectionReducers.js";
import { elementsReducers } from "../elements/elementsReducers.js";

/**
 * @internal
 */
export const rootReducers = {
    ...initReducers,
    ...loadAttributeReducers,
    ...loadInitialElementsPageReducers,
    ...loadNextElementsPageReducers,
    ...loadCustomElementsReducers,
    ...selectionReducers,
    ...elementsReducers,
};
