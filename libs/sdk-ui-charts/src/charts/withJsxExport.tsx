// (C) 2019-2025 GoodData Corporation

import { ComponentType, Component as ReactComponent } from "react";

import hoistNonReactStatics from "hoist-non-react-statics";
import { isFunction, isString } from "lodash-es";

import { factoryNotationFor } from "@gooddata/sdk-model";

const getDisplayName = (WrappedComponent: ComponentType): string =>
    WrappedComponent.displayName || WrappedComponent.name || "Component";

/**
 * @internal
 */
export const withJsxExport = <T extends object>(Component: ComponentType<T>): ComponentType<T> => {
    const result = class extends ReactComponent<T> {
        public static displayName = `WithJsxExport(${getDisplayName(Component as ComponentType)})`;

        public toJsx = (): string => {
            const stringifiedProps = Object.entries(this.props)
                // we ignore functions as there is no bullet-proof to serialize them
                .filter(([_, value]) => !isFunction(value))
                .map(([key, value]) =>
                    isString(value) ? `${key}="${value}"` : `${key}={${factoryNotationFor(value)}}`,
                );
            const paddedPropDeclarations = stringifiedProps.join("\n").replace(/^/gm, "    ");
            return `<${getDisplayName(Component as ComponentType)}\n${paddedPropDeclarations}\n/>`;
        };

        public override render() {
            return <Component {...this.props} />;
        }
    };

    hoistNonReactStatics(result, Component as ComponentType);

    return result;
};
