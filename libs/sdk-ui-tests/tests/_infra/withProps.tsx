// (C) 2023-2025 GoodData Corporation

import { ComponentClass } from "react";

/**
 * This HOC enables to extract effective props passed to the wrapped component
 */
export const withPropsExtractor = () => {
    let effectiveProps: any;
    const extractProps = () => effectiveProps;
    return {
        wrap: (Component: ComponentClass) => (props: any) => {
            effectiveProps = { ...Component.defaultProps, ...props };
            return <Component {...props} />;
        },
        extractProps,
    };
};
