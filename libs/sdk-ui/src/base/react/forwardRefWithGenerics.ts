// (C) 2025 GoodData Corporation

import React from "react";

/**
 * Usage: first define your component with generics and a second argument `ref`,
 * then define another const wrapping the original component with `forwardRefWithGenerics`
 *
 * @internal
 */
export function forwardRefWithGenerics<T, P>(
    render: (props: React.PropsWithoutRef<P>, ref: React.Ref<T>) => React.ReactNode,
): (props: React.PropsWithoutRef<P> & React.RefAttributes<T>) => React.ReactNode {
    return React.forwardRef(render) as any;
}
