// (C) 2019-2022 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import identity from "lodash/identity.js";
import {
    IPlaceholder,
    IComposedPlaceholder,
    PlaceholdersResolvedValues,
    ComposedPlaceholderResolutionContext,
    Flatten,
    UnionToIntersection,
} from "./base.js";
import { useComposedPlaceholder, usePlaceholder } from "./hooks.js";
/**
 * Common placeholder options.
 * @public
 */
export interface IPlaceholderOptions<T> {
    /**
     * By default, each placeholder has a unique generated id.
     *
     * @remarks
     * You can provide id of the placeholder which can be useful for debugging.
     * Please note that the id should be unique for all your placeholders.
     */
    id?: string;

    /**
     * Provide function to validate the placeholder value.
     */
    validate?: (value?: T) => void;
}

/**
 * Create a new placeholder.
 * See {@link IPlaceholder}.
 *
 * @public
 */
export function newPlaceholder<T>(defaultValue?: T, options: IPlaceholderOptions<T> = {}): IPlaceholder<T> {
    const { id, validate } = options;
    const placeholder: IPlaceholder<T> = {
        type: "IPlaceholder",
        id: id ?? uuidv4(),
        defaultValue,
        validate,
        // eslint-disable-next-line react-hooks/rules-of-hooks
        use: () => usePlaceholder(placeholder),
    };

    return placeholder;
}

/**
 * Create a new composed placeholder.
 * See {@link IComposedPlaceholder}.
 *
 * @public
 */
export function newComposedPlaceholder<
    TValue extends any[],
    TReturn = PlaceholdersResolvedValues<TValue>,
    // By default, set resolution context to intersection of resolution contexts
    // of the provided placeholders.
    TContext = UnionToIntersection<ComposedPlaceholderResolutionContext<Flatten<TValue>>>,
>(
    placeholders: [...TValue],
    computeValue: (
        values: PlaceholdersResolvedValues<TValue>,
        resolutionContext: TContext,
    ) => TReturn = identity,
): IComposedPlaceholder<TReturn, TValue, TContext> {
    const placeholder: IComposedPlaceholder<TReturn, TValue, TContext> = {
        type: "IComposedPlaceholder",
        placeholders,
        computeValue,
        // eslint-disable-next-line react-hooks/rules-of-hooks
        use: (resolutionContext: TContext) => useComposedPlaceholder(placeholder, resolutionContext),
    };

    return placeholder;
}
