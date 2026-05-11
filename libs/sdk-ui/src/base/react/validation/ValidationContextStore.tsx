// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { v4 as uuid } from "uuid";

import { createContextStore } from "../contextStore.js";
import { useAutoupdateRef } from "../useAutoupdateRef.js";

import {
    type IChildRegistration,
    type IInvalidDatapoint,
    type IInvalidNode,
    type IInvalidNodeAtPath,
    type IInvalidNodePath,
    type IValidationContextValue,
} from "./types.js";
import {
    getInvalidDatapointsInTree,
    getInvalidNodeAtPath,
    getUpdatedInvalidTree,
    validationSeverityNum,
} from "./utils.js";

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

    // Latest rootNode ref — allows mutators to read current state and propagate to parent without effects.
    const rootNodeRef = useRef(initialValue);
    rootNodeRef.current = rootNode;

    const registrationRef = useRef<IChildRegistration | null>(null);

    useEffect(() => {
        if (!isChildContext) {
            return;
        }

        registrationRef.current = registerOnParentRef.current?.(rootNodeRef.current) ?? null;

        return () => {
            registrationRef.current?.unregister();
            registrationRef.current = null;
        };
    }, [isChildContext, registerOnParentRef]);

    const updateRootNode = useCallback((updater: (current: T) => T) => {
        const next = updater(rootNodeRef.current);
        rootNodeRef.current = next;
        setRootNode(next);
        registrationRef.current?.update(next);
    }, []);

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

            updateRootNode((current) => getUpdatedInvalidTree(current, invalidNodeSetter, path));
        },
        [updateRootNode],
    );

    const registerChild = useCallback(
        (child: IInvalidNode): IChildRegistration => {
            const id = `${child.id}-${uuid()}`;

            updateRootNode((current) => ({
                ...current,
                children: {
                    ...current.children,
                    [id]: child,
                },
            }));

            return {
                update: (updatedChild: IInvalidNode) => {
                    // Spread with an existing key preserves its position in the object,
                    // so the child order remains stable across updates.
                    updateRootNode((current) => ({
                        ...current,
                        children: {
                            ...current.children,
                            [id]: updatedChild,
                        },
                    }));
                },
                unregister: () => {
                    updateRootNode((current) => ({
                        ...current,
                        children: Object.fromEntries(
                            Object.entries(current.children).filter(([key]) => key !== id),
                        ),
                    }));
                },
            };
        },
        [updateRootNode],
    );

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
