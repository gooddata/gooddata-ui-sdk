// (C) 2022-2025 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import { isEqual } from "lodash-es";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeElement,
    type IAttributeFilter,
    type ObjRef,
    filterObjRef,
} from "@gooddata/sdk-model";
import { usePrevious } from "@gooddata/sdk-ui";

import {
    type IMultiSelectAttributeFilterHandler,
    newAttributeFilterHandler,
} from "../../AttributeFilterHandler/index.js";

/**
 * Properties of the {@link useAttributeFilterHandler} hook.
 * @beta
 */
export interface IUseAttributeFilterHandlerProps {
    backend: IAnalyticalBackend;
    workspace: string;

    filter: IAttributeFilter;
    displayAsLabel: ObjRef;

    hiddenElements?: string[];
    staticElements?: IAttributeElement[];
    withoutApply?: boolean;
}

/**
 * Hook for retrieving AttributeFilterHandler {@link IMultiSelectAttributeFilterHandler} Core API for Attribute Filter components.
 * This hook is responsible for initialization of the AttributeFilterHandler.
 * @beta
 */
export const useAttributeFilterHandler = (props: IUseAttributeFilterHandlerProps) => {
    const {
        backend,
        workspace,

        filter,
        displayAsLabel,

        hiddenElements,
        staticElements,
        withoutApply = false,
    } = props;

    const [, setInvalidate] = useState(0);

    const invalidate = () => {
        setInvalidate((s) => s + 1);
    };

    const handlerRef = useRef<IMultiSelectAttributeFilterHandler | null>(null);

    const createNewHandler = useCallback(() => {
        handlerRef.current = newAttributeFilterHandler(
            backend.withTelemetry("AttributeFilter", { workspace, filter, hiddenElements, staticElements }),
            workspace,
            filter,
            {
                selectionMode: "multi",
                hiddenElements,
                staticElements,
                displayAsLabel,
                withoutApply,
            },
        );
    }, [backend, workspace, filter, hiddenElements, staticElements, displayAsLabel, withoutApply]);

    if (!handlerRef.current) {
        createNewHandler();
    }

    const handler = handlerRef.current;

    const prevProps = usePrevious(props);

    useEffect(() => {
        if (!handler) {
            return;
        }

        const unsubscribe = handler.onUpdate(() => {
            invalidate();
        });

        const filterChanged = (filter: IAttributeFilter, handler: IMultiSelectAttributeFilterHandler) => {
            const currentFilter = handler.getFilter();
            const originalFilter = handler.getOriginalFilter();
            return (
                currentFilter &&
                originalFilter &&
                !isEqual(filterObjRef(filter), filterObjRef(currentFilter)) &&
                !isEqual(filterObjRef(filter), filterObjRef(originalFilter))
            );
        };

        if (
            backend !== prevProps?.backend ||
            workspace !== prevProps?.workspace ||
            filterChanged(filter, handler) ||
            !isEqual(staticElements, prevProps?.staticElements) ||
            !isEqual(hiddenElements, prevProps?.hiddenElements)
        ) {
            createNewHandler();
            invalidate();
        }
        return () => {
            unsubscribe();
        };
    }, [backend, workspace, filter, staticElements, hiddenElements, prevProps, handler, createNewHandler]);

    return handler;
};
