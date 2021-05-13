// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ErrorComponent } from "@gooddata/sdk-ui";

export const ErrorExample: React.FC = () => {
    return (
        <ErrorComponent
            icon="gd-icon-ghost"
            className="s-default-Error"
            message="This is an Custom Error"
            description="…with description."
            height={200}
        />
    );
};
