// (C) 2019-2025 GoodData Corporation

import React from "react";

import hoistNonReactStatics from "hoist-non-react-statics";
import isFunction from "lodash/isFunction.js";
import isString from "lodash/isString.js";
import toPairs from "lodash/toPairs.js";

import { factoryNotationFor } from "@gooddata/sdk-model";

const getDisplayName = (WrappedComponent: React.ComponentType): string =>
    WrappedComponent.displayName || WrappedComponent.name || "Component";

/**
 * @internal
 */
export const withJsxExport = <T extends object>(
    Component: React.ComponentType<T>,
): React.ComponentType<T> => {
    const result = class extends React.Component<T> {
        public static displayName = `WithJsxExport(${getDisplayName(Component as React.ComponentType)})`;

        public toJsx = (): string => {
            const stringifiedProps = toPairs(this.props)
                // we ignore functions as there is no bullet-proof to serialize them
                .filter(([_, value]) => !isFunction(value))
                .map(([key, value]) =>
                    isString(value) ? `${key}="${value}"` : `${key}={${factoryNotationFor(value)}}`,
                );
            const paddedPropDeclarations = stringifiedProps.join("\n").replace(/^/gm, "    ");
            return `<${getDisplayName(Component as React.ComponentType)}\n${paddedPropDeclarations}\n/>`;
        };

        public override render() {
            return <Component {...this.props} />;
        }
    };

    hoistNonReactStatics(result, Component as React.ComponentType);

    return result;
};
