// (C) 2025 GoodData Corporation

import { type PropsWithoutRef, type ReactNode, type Ref, type RefAttributes, forwardRef } from "react";

/**
 * Usage: first define your component with generics and a second argument `ref`,
 * then define another const wrapping the original component with `forwardRefWithGenerics`
 *
 * @internal
 */
export function forwardRefWithGenerics<T, P>(
    render: (props: PropsWithoutRef<P>, ref: Ref<T>) => ReactNode,
): (props: PropsWithoutRef<P> & RefAttributes<T>) => ReactNode {
    return forwardRef(render) as any;
}
