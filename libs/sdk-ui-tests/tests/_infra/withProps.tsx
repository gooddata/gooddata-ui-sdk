// (C) 2023 GoodData Corporation

import React from "react";

/**
 * This HOC enables to extract effective props passed to the wrapped component
 */
export const withPropsExtractor = () => {
    let effectiveProps: any;
    const extractProps = () => effectiveProps;
    return {
        wrap: (Component: React.ComponentType) => (props: any) => {
            effectiveProps = { ...Component.defaultProps, ...props };
            return <Component {...props} />;
        },
        extractProps,
    };
};
