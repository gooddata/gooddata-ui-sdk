// (C) 2021-2022 GoodData Corporation
import { initReducers } from "../init/initReducers";
import { loadAttributeReducers } from "../loadAttribute/loadAttributeReducers";
import { loadCustomElementsReducers } from "../loadCustomElements/loadCustomElementsReducers";
import { loadInitialElementsPageReducers } from "../loadInitialElementsPage/loadInitialElementsPageReducers";
import { loadNextElementsPageReducers } from "../loadNextElementsPage/loadNextElementsPageReducers";
import { selectionReducers } from "../selection/selectionReducers";
import { elementsReducers } from "../elements/elementsReducers";

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
