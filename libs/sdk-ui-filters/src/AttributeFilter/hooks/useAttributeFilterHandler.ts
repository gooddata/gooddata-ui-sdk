// (C) 2022-2024 GoodData Corporation
import { useEffect, useRef, useState, useCallback } from "react";
import isEqual from "lodash/isEqual.js";
import { usePrevious } from "@gooddata/sdk-ui";
import { IAttributeElement, IAttributeFilter, ObjRef, filterObjRef } from "@gooddata/sdk-model";

import {
    IMultiSelectAttributeFilterHandler,
    newAttributeFilterHandler,
} from "../../AttributeFilterHandler/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

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
    enableDuplicatedLabelValuesInAttributeFilter: boolean;
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
        enableDuplicatedLabelValuesInAttributeFilter,
    } = props;

    const [, setInvalidate] = useState(0);

    const invalidate = () => {
        setInvalidate((s) => s + 1);
    };

    const handlerRef = useRef<IMultiSelectAttributeFilterHandler>();

    const createNewHandler = useCallback(() => {
        handlerRef.current = newAttributeFilterHandler(
            backend.withTelemetry("AttributeFilter", { workspace, filter, hiddenElements, staticElements }),
            workspace,
            filter,
            {
                selectionMode: "multi",
                hiddenElements,
                staticElements,
                enableDuplicatedLabelValuesInAttributeFilter,
                displayAsLabel,
            },
        );
    }, [
        backend,
        workspace,
        filter,
        hiddenElements,
        staticElements,
        enableDuplicatedLabelValuesInAttributeFilter,
        displayAsLabel,
    ]);

    if (!handlerRef.current) {
        createNewHandler();
    }

    const handler = handlerRef.current;

    const prevProps = usePrevious(props);

    useEffect(() => {
        const unsubscribe = handler.onUpdate(() => {
            invalidate();
        });

        if (
            backend !== prevProps.backend ||
            workspace !== prevProps.workspace ||
            (!isEqual(filterObjRef(filter), filterObjRef(handler.getFilter())) &&
                !isEqual(filterObjRef(filter), filterObjRef(handler.getOriginalFilter()))) ||
            !isEqual(staticElements, prevProps.staticElements) ||
            !isEqual(hiddenElements, prevProps.hiddenElements)
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
