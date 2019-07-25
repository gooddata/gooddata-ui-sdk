// (C) 2019 GoodData Corporation
import * as React from "react";
import isFunction = require("lodash/isFunction");
import isString = require("lodash/isString");
import toPairs = require("lodash/toPairs");
// @ts-ignore The typings are not compatible with current react typings and upgrade is not feasible now
import hoistNonReactStatics = require("hoist-non-react-statics");

import { getModelNotationFor } from "../helpers/model/objectToModelNotation";

const getDisplayName = (WrappedComponent: React.ComponentType): string =>
    WrappedComponent.displayName || WrappedComponent.name || "Component";

export const withJsxExport = <T extends {}>(Component: React.ComponentType<T>) => {
    const result = class extends React.Component<T> {
        public static displayName = `WithJsxExport(${getDisplayName(Component)})`;

        public toJsx = (): string => {
            const stringifiedProps = toPairs(this.props)
                // we ignore functions as there is no bullet-proof to serialize them
                .filter(([_, value]) => !isFunction(value))
                .map(([key, value]) =>
                    isString(value) ? `${key}="${value}"` : `${key}={${getModelNotationFor(value)}}`,
                );
            const paddedPropDeclarations = stringifiedProps.join("\n").replace(/^/gm, "    ");
            return `<${getDisplayName(Component)}\n${paddedPropDeclarations}\n/>`;
        };

        public render(): React.ReactNode {
            return <Component {...this.props} />;
        }
    };

    hoistNonReactStatics(result, Component);

    return result;
};
