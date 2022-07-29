// (C) 2022 GoodData Corporation
import React, { useContext, useMemo } from "react";
import { DefaultResult } from "../hooks/attributeFilterHandlerDefaultResult";
import { DefaultContextOwnState } from "./AttributeFilterContextDefaultOwnState";
import { useBackend, useWorkspace } from "@gooddata/sdk-ui";
import { useFilterPlaceholderResolver } from "../hooks/useFilterPlaceholderResolver";
import { useParentFiltersPlaceholderResolver } from "../hooks/useParentFiltersPlaceholderResolver";
import { useAttributeFilterHandler } from "../hooks/useAttributeFilterHandler";
import {
    IAttributeFilterContext,
    IAttributeFilterContextOwnState,
    IAttributeFilterProviderProps,
    useOwnPropsResolverProps,
} from "./types";

export const AttributeFilterContextDefaultState: IAttributeFilterContext = {
    ...DefaultResult,
    ...DefaultContextOwnState,
};

export const AttributeFilterContext = React.createContext<IAttributeFilterContext>(
    AttributeFilterContextDefaultState,
);

AttributeFilterContext.displayName = "AttributeFilterContext";

/**
 * @internal
 */
export const useAttributeFilterContext = (): IAttributeFilterContext => useContext(AttributeFilterContext);

/**
 * @internal
 */
export const AttributeFilterContextProvider: React.FC<IAttributeFilterProviderProps> = (props) => {
    const {
        filter: inputFilter,
        connectToPlaceholder,
        identifier,
        onApply,
        parentFilters,
        parentFilterOverAttribute,
        children,
        title,
    } = props;

    const backend = useBackend();
    const workspace = useWorkspace();

    const { filter, onFilterPlaceholderApply } = useFilterPlaceholderResolver(
        inputFilter,
        connectToPlaceholder,
        identifier,
        onApply,
    );

    const { limitingAttributeFilters } = useParentFiltersPlaceholderResolver(
        parentFilters,
        parentFilterOverAttribute,
    );

    const handlerResult = useAttributeFilterHandler({
        backend,
        workspace,
        filter,
        limitingAttributeFilters,
    });

    const ownState = useOwnStateResolver({ title, handlerResult: handlerResult, onFilterPlaceholderApply });

    const contextValue: IAttributeFilterContext = {
        ...handlerResult,
        ...ownState,
    };

    return <AttributeFilterContext.Provider value={contextValue}>{children}</AttributeFilterContext.Provider>;
};

const useOwnStateResolver = (props: useOwnPropsResolverProps): IAttributeFilterContextOwnState => {
    const { title, handlerResult: handlerState, onFilterPlaceholderApply } = props;
    const initStatus = handlerState.initialization.status;
    const attributeTitle = handlerState.attribute.data?.title;
    const isWorkingSelectionChanged = handlerState.isWorkingSelectionChanged();
    const isWorkingSelectionEmpty = handlerState.isWorkingSelectionEmpty();

    const attributeFilterTitle = useMemo(() => {
        return title || initStatus === "success" ? attributeTitle : "";
    }, [initStatus, title, attributeTitle]);

    const isApplyDisabled = useMemo(() => {
        //TODO isApplyDisabled || hasNoData || hasNoMatchingData || !!bodyProps.error;
        // isApplyDisabled has to by provided from props too
        return isWorkingSelectionChanged || isWorkingSelectionEmpty;
    }, [isWorkingSelectionChanged, isWorkingSelectionEmpty]);

    return {
        attributeFilterTitle,
        isApplyDisabled,
        onFilterPlaceholderApply,
    };
};
