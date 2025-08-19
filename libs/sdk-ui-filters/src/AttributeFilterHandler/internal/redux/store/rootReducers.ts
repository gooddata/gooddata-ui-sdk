// (C) 2021-2025 GoodData Corporation
import { displayFormsReducers } from "../displayForms/displayFormsReducers.js";
import { elementsReducers } from "../elements/elementsReducers.js";
import { initReducers } from "../init/initReducers.js";
import { loadAttributeReducers } from "../loadAttribute/loadAttributeReducers.js";
import { loadCustomElementsReducers } from "../loadCustomElements/loadCustomElementsReducers.js";
import { loadInitialElementsPageReducers } from "../loadInitialElementsPage/loadInitialElementsPageReducers.js";
import { loadIrrelevantElementsReducers } from "../loadIrrelevantElements/loadIrrelevantElementsReducers.js";
import { loadNextElementsPageReducers } from "../loadNextElementsPage/loadNextElementsPageReducers.js";
import { selectionReducers } from "../selection/selectionReducers.js";
/**
 * @internal
 */
export const rootReducers = {
    ...initReducers,
    ...loadAttributeReducers,
    ...loadInitialElementsPageReducers,
    ...loadNextElementsPageReducers,
    ...loadCustomElementsReducers,
    ...loadIrrelevantElementsReducers,
    ...selectionReducers,
    ...elementsReducers,
    ...displayFormsReducers,
};
