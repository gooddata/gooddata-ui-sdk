// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { v4 as uuid } from "uuid";

import {
    IInvalidDatapoint,
    IInvalidNode,
    IInvalidNodeAtPath,
    IInvalidNodePath,
    IValidationContextValue,
} from "./types.js";
import {
    getInvalidDatapointsInTree,
    getInvalidNodeAtPath,
    getUpdatedInvalidTree,
    validationSeverityNum,
} from "./utils.js";
import { createContextStore } from "../contextStore.js";
import { useAutoupdateRef } from "../useAutoupdateRef.js";

/**
 * @internal
 */
export const ValidationContextStore = createContextStore<IValidationContextValue<any>>("validationContext");

/**
 * @internal
 */
export const useValidationContextValue = <T extends IInvalidNode>(
    initialValue: T,
): IValidationContextValue<T> => {
    const registerOnParent = ValidationContextStore.useContextStoreOptional((ctx) => ctx.registerChild);
    const registerOnParentRef = useAutoupdateRef(registerOnParent);
    const isChildContext = !!registerOnParent;

    const [rootNode, setRootNode] = useState(initialValue);

    useEffect(() => {
        if (!isChildContext) {
            return;
        }

        const unregister = registerOnParentRef.current?.(rootNode);
        return () => {
            unregister?.();
        };
    }, [isChildContext, registerOnParentRef, rootNode]);

    const getInvalidDatapoints = useCallback(
        <P extends IInvalidNodePath<T>>({
            path = [] as P,
            recursive = false,
        }: { path?: P; recursive?: boolean } = {}) => {
            const node: IInvalidNode<any> = getInvalidNodeAtPath(rootNode, path);

            return recursive ? getInvalidDatapointsInTree(node) : node.invalidDatapoints;
        },
        [rootNode],
    );

    const setInvalidDatapoints = useCallback(
        <P extends IInvalidNodePath<T>>(
            setter: (
                currentNode: IInvalidNodeAtPath<T, P>,
            ) => Array<IInvalidDatapoint | undefined | null | false | "">,
            path: P = [] as P,
        ) => {
            const invalidNodeSetter = (currentNode: IInvalidNodeAtPath<T, P>) => {
                const unfilteredDatapoints = setter(currentNode);
                return {
                    ...currentNode,
                    invalidDatapoints: unfilteredDatapoints.filter((datapoint) => !!datapoint),
                };
            };

            setRootNode((currentRootNode) => getUpdatedInvalidTree(currentRootNode, invalidNodeSetter, path));
        },
        [],
    );

    const registerChild = useCallback((child: IInvalidNode) => {
        const id = `${child.id}-${uuid()}`;

        setRootNode((currentRootNode) => ({
            ...currentRootNode,
            children: {
                ...currentRootNode.children,
                [id]: child,
            },
        }));

        return () => {
            setRootNode((currentRootNode) => ({
                ...currentRootNode,
                children: Object.fromEntries(
                    Object.entries(currentRootNode.children).filter(([key]) => key !== id),
                ),
            }));
        };
    }, []);

    const isValid = useMemo(() => {
        return getInvalidDatapointsInTree(rootNode).every(
            (datapoint) => validationSeverityNum(datapoint.severity) < validationSeverityNum("error"),
        );
    }, [rootNode]);

    return {
        rootNode,
        setInvalidDatapoints,
        getInvalidDatapoints,
        isValid,
        registerChild,
    };
};
