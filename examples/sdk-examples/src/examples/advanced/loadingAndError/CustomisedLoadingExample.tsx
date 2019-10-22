// (C) 2007-2019 GoodData Corporation
import React from "react";
import { LoadingComponent } from "@gooddata/sdk-ui";

export const CustomisedLoadingExample: React.FC = () => {
    return (
        <LoadingComponent
            className="s-customised-loading"
            color="tomato"
            height={300}
            imageHeight={16}
            speed={2}
        />
    );
};
