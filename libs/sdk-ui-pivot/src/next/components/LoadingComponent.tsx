// (C) 2025 GoodData Corporation
import React from "react";

import { LoadingDots } from "@gooddata/sdk-ui-kit";

/**
 * TODO: new ui-kit component
 *
 * @alpha
 */
export const LoadingComponent = () => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
            }}
        >
            <LoadingDots />
        </div>
    );
};
