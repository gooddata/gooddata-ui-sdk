// (C) 2025-2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    type IInvalidDatapoint,
    type IInvalidNode,
    type IInvalidNodeAtPath,
    type IInvalidNodePath,
    type IValidationSeverity,
} from "./types.js";

/**
 * @internal
 */
export const validationSeverity = ["info", "warning", "error"] as const satisfies IValidationSeverity[];

/**
 * @internal
 */
export const validationSeverityNum = (severity: IValidationSeverity) => validationSeverity.indexOf(severity);

/**
 * @internal
 */
export const getInvalidNodeAtPath = <T extends IInvalidNode<any>, P extends IInvalidNodePath<T>>(
    node: T,
    path: P = [] as P,
): IInvalidNodeAtPath<T, P> => {
    // @ts-expect-error - TS has problems with potential depth of rest
    const [key, ...rest] = path;

    if (key === undefined) {
        return node as IInvalidNodeAtPath<T, P>;
    }

    if (!key || !(key in node.children)) {
        throw new Error(`Invalid path ${path}`);
    }

    return getInvalidNodeAtPath(node.children[key], rest as any);
};

/**
 * @internal
 */
export const getInvalidDatapointsInTree = <T extends IInvalidNode<any>>(rootNode: T): IInvalidDatapoint[] => {
    return [
        ...rootNode.invalidDatapoints,
        ...Object.values(rootNode.children ?? {}).flatMap((subNode) =>
            getInvalidDatapointsInTree(subNode as IInvalidNode),
        ),
    ];
};

/**
 * @internal
 */
export const createInvalidDatapoint = (input: Partial<IInvalidDatapoint> = {}) =>
    ({
        message: "",
        severity: "error",
        id: `invalid-datapoint-${uuid()}`,
        ...input,
    }) satisfies IInvalidDatapoint;

/**
 * @internal
 */
export function createInvalidNode(): IInvalidNode<Record<string, never>>;
/**
 * @internal
 */
export function createInvalidNode<T extends Record<string, IInvalidNode<any>>>(
    input: Partial<IInvalidNode<T>> & { children: T },
): IInvalidNode<T>;
/**
 * @internal
 */
export function createInvalidNode<T extends Record<string, IInvalidNode<any>> = Record<string, never>>(
    input?: Partial<IInvalidNode<T>>,
): IInvalidNode<T>;
/**
 * @internal
 */
export function createInvalidNode<T extends Record<string, IInvalidNode<any>> = Record<string, never>>(
    input: Partial<IInvalidNode<T>> = {},
): IInvalidNode<T> {
    return {
        id: `invalid-node-${uuid()}`,
        invalidDatapoints: [],
        children: {} as T,
        ...input,
    } satisfies IInvalidNode<T>;
}

/**
 * @internal
 */
export const getUpdatedInvalidTree = <T extends IInvalidNode<any>, P extends IInvalidNodePath<T>>(
    rootNode: T,
    updater: (node: IInvalidNodeAtPath<T, P>) => IInvalidNodeAtPath<T, P>,
    path: P = [] as P,
): T => {
    // @ts-expect-error - TS has problems with potential depth of rest
    const [key, ...rest] = path;

    if (key === undefined) {
        return updater(rootNode as IInvalidNodeAtPath<T, P>) as T;
    }

    if (!key || !(key in rootNode.children)) {
        throw new Error(`Invalid path ${path}`);
    }

    const updatedChild = getUpdatedInvalidTree(rootNode.children[key], updater, rest as any);

    return {
        ...rootNode,
        children: {
            ...rootNode.children,
            [key]: updatedChild,
        },
    } as T;
};
