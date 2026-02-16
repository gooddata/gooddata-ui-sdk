// (C) 2023-2026 GoodData Corporation

import { type ComponentClass, type ComponentType } from "react";

/**
 * This HOC enables to extract effective props passed to the wrapped component
 */
export const withPropsExtractor = () => {
    let effectiveProps: any;
    const extractProps = () => effectiveProps;
    return {
        wrap: (Component: ComponentType) => (props: any) => {
            effectiveProps = { ...(Component as unknown as ComponentClass)["defaultProps"], ...props };
            return <Component {...props} />;
        },
        extractProps,
    };
};
