// (C) 2019-2025 GoodData Corporation
import {
    ComponentType,
    forwardRef,
    ForwardRefExoticComponent,
    PropsWithoutRef,
    RefAttributes,
    useImperativeHandle,
} from "react";
import isFunction from "lodash/isFunction.js";
import isString from "lodash/isString.js";
import toPairs from "lodash/toPairs.js";
import hoistNonReactStatics from "hoist-non-react-statics";
import { factoryNotationFor } from "@gooddata/sdk-model";

const getDisplayName = (WrappedComponent: ComponentType): string =>
    WrappedComponent.displayName || WrappedComponent.name || "Component";

/**
 * @internal
 */
export function withJsxExport<T extends object>(
    Component: ComponentType<T>,
): ForwardRefExoticComponent<PropsWithoutRef<T> & RefAttributes<{ toJsx: () => string }>> {
    const Result = forwardRef<{ toJsx: () => string }, T>((props, ref) => {
        const toJsx = () => {
            const stringifiedProps = toPairs(props)
                // we ignore functions as there is no bullet-proof to serialize them
                .filter(([_, value]) => !isFunction(value))
                .map(([key, value]) =>
                    isString(value) ? `${key}="${value}"` : `${key}={${factoryNotationFor(value)}}`,
                );
            const paddedPropDeclarations = stringifiedProps.join("\n").replace(/^/gm, "    ");
            return `<${getDisplayName(Component)}\n${paddedPropDeclarations}\n/>`;
        };

        useImperativeHandle(ref, () => ({
            toJsx,
        }));

        return <Component {...(props as T)} />;
    });

    Result.displayName = `WithJsxExport(${getDisplayName(Component)})`;

    hoistNonReactStatics(Result, Component);

    return Result;
}
