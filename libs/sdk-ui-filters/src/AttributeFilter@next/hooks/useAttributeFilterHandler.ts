// (C) 2022 GoodData Corporation
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IMultiSelectAttributeFilterHandler, newAttributeFilterHandler } from "../../AttributeFilterHandler";
import { AttributeFilterHandlerProps, IAttributeFilterHandlerResult, IAttributeHandlerState } from "./types";
import { usePrevious } from "@gooddata/sdk-ui";

export const useAttributeFilterHandler = (
    props: AttributeFilterHandlerProps,
): IAttributeFilterHandlerResult => {
    const { backend, workspace, filter, limitingAttributeFilters } = props;
    const [, setInvalidate] = useState(0);
    const initializedRef = useRef(false);

    const invalidate = () => {
        setInvalidate((s) => s + 1);
    };

    const attributeFilterHandler = useMemo<IMultiSelectAttributeFilterHandler>(() => {
        initializedRef.current = false;
        return newAttributeFilterHandler(backend, workspace, filter, { selectionMode: "multi" });
    }, [backend, workspace, filter]);

    const prevAttributeFilterHandler = usePrevious(attributeFilterHandler);
    const prevLimitingAttributeFilters = usePrevious(limitingAttributeFilters);

    useEffect(() => {
        const initialized = initializedRef.current;

        const unsubscribe = attributeFilterHandler.onUpdate(() => {
            invalidate();
        });

        attributeFilterHandler.setLimit(20); // testing small paging
        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFilters);

        if (!initialized || attributeFilterHandler !== prevAttributeFilterHandler) {
            initializedRef.current = true;
            attributeFilterHandler.init();
        } else {
            if (limitingAttributeFilters !== prevLimitingAttributeFilters) {
                attributeFilterHandler.loadInitialElementsPage();
            }
        }

        () => {
            unsubscribe();
        };
    }, [
        attributeFilterHandler,
        limitingAttributeFilters,
        prevAttributeFilterHandler,
        prevLimitingAttributeFilters,
    ]);

    const onSearch = useCallback(
        (search: string) => {
            if (attributeFilterHandler.getSearch() !== search) {
                attributeFilterHandler.setSearch(search);
            }

            attributeFilterHandler.loadInitialElementsPage();
        },
        [attributeFilterHandler],
    );

    const onReset = useCallback(() => {
        attributeFilterHandler.setSearch("");
        attributeFilterHandler.revertSelection();
        attributeFilterHandler.loadInitialElementsPage();
    }, [attributeFilterHandler]);

    const onNextPageRequest = useCallback(() => {
        attributeFilterHandler.loadNextElementsPage();
    }, [attributeFilterHandler]);

    const state = useLoaderState(attributeFilterHandler);

    return {
        ...state,
        getCurrentFilter: attributeFilterHandler.getFilter,
        isCurrentFilterInverted: () => attributeFilterHandler.getCommittedSelection().isInverted,
        commitSelection: attributeFilterHandler.commitSelection,
        changeSelection: attributeFilterHandler.changeSelection,
        isWorkingSelectionEmpty: attributeFilterHandler.isWorkingSelectionEmpty,
        isWorkingSelectionChanged: attributeFilterHandler.isWorkingSelectionChanged,
        onSearch,
        onReset,
        onNextPageRequest,
    };
};

const useLoaderState = (loader: IMultiSelectAttributeFilterHandler): IAttributeHandlerState => {
    const workingSelection = loader.getWorkingSelection();
    const committedSelection = loader.getCommittedSelection();

    const initStatus = loader.getInitStatus();

    return {
        initialization: {
            status: loader.getInitStatus(),
            error: loader.getInitError(),
        },
        attribute: {
            data: loader.getAttribute(),
            status: loader.getAttributeStatus(),
            error: loader.getAttributeError(),
        },
        elements: {
            data: loader.getAllElements(),
            totalCount: loader.getTotalElementsCount(),
            totalCountWithCurrentSettings: loader.getTotalElementsCountWithCurrentSettings(),
            initialPageLoad: {
                status: loader.getInitialElementsPageStatus(),
                error: loader.getInitialElementsPageError(),
            },
            nextPageLoad: {
                status: loader.getNextElementsPageStatus(),
                error: loader.getNextElementsPageError(),
            },
            currentOptions: {
                search: loader.getSearch(),
                offset: loader.getOffset(),
                limit: loader.getLimit(),
            },
        },
        selection: {
            committed: {
                elements: initStatus === "success" ? loader.getElementsByKey(committedSelection.keys) : [],
                keys: committedSelection.keys,
                isInverted: committedSelection.isInverted,
            },
            working: {
                elements: initStatus === "success" ? loader.getElementsByKey(workingSelection.keys) : [],
                keys: workingSelection.keys,
                isInverted: workingSelection.isInverted,
                isChanged: loader.isWorkingSelectionChanged(),
                isEmpty: loader.isWorkingSelectionEmpty(),
            },
        },
    };
};
