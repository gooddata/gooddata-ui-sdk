// (C) 2022 GoodData Corporation
import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler/index.js";

/**
 * @internal
 */
export const useAttributeFilterHandlerMethods = (handler: IMultiSelectAttributeFilterHandler) => {
    return {
        init: handler.init,

        onInitStart: handler.onInitStart,
        onInitSuccess: handler.onInitSuccess,
        onInitError: handler.onInitError,
        onInitCancel: handler.onInitCancel,

        loadAttribute: handler.loadAttribute,
        cancelAttributeLoad: handler.cancelAttributeLoad,

        onLoadAttributeStart: handler.onLoadAttributeStart,
        onLoadAttributeSuccess: handler.onLoadAttributeSuccess,
        onLoadAttributeError: handler.onLoadAttributeError,
        onLoadAttributeCancel: handler.onLoadAttributeCancel,

        loadInitialElementsPage: handler.loadInitialElementsPage,
        cancelInitialElementsPageLoad: handler.cancelInitialElementsPageLoad,

        onLoadInitialElementsPageStart: handler.onLoadInitialElementsPageStart,
        onLoadInitialElementsPageSuccess: handler.onLoadInitialElementsPageSuccess,
        onLoadInitialElementsPageError: handler.onLoadInitialElementsPageError,
        onLoadInitialElementsPageCancel: handler.onLoadInitialElementsPageCancel,

        loadNextElementsPage: handler.loadNextElementsPage,
        cancelNextElementsPageLoad: handler.cancelNextElementsPageLoad,

        onLoadNextElementsPageStart: handler.onLoadNextElementsPageStart,
        onLoadNextElementsPageSuccess: handler.onLoadNextElementsPageSuccess,
        onLoadNextElementsPageError: handler.onLoadNextElementsPageError,
        onLoadNextElementsPageCancel: handler.onLoadNextElementsPageCancel,

        loadCustomElements: handler.loadCustomElements,
        cancelCustomElementsLoad: handler.cancelCustomElementsLoad,

        onLoadCustomElementsStart: handler.onLoadCustomElementsStart,
        onLoadCustomElementsSuccess: handler.onLoadCustomElementsSuccess,
        onLoadCustomElementsError: handler.onLoadCustomElementsError,
        onLoadCustomElementsCancel: handler.onLoadCustomElementsCancel,

        setOrder: handler.setOrder,
        setSearch: handler.setSearch,
        setLimit: handler.setLimit,
        setLimitingAttributeFilters: handler.setLimitingAttributeFilters,
        setLimitingDateFilters: handler.setLimitingDateFilters,
        setLimitingMeasures: handler.setLimitingMeasures,

        changeSelection: handler.changeSelection,
        clearSelection: handler.clearSelection,
        revertSelection: handler.revertSelection,
        invertSelection: handler.invertSelection,
        commitSelection: handler.commitSelection,
    };
};
