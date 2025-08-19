// (C) 2023-2025 GoodData Corporation
import React from "react";

import { Typography } from "@gooddata/sdk-ui-kit";

interface IConfigurationCategoryProps {
    categoryTitle: string;
}

export const ConfigurationCategory: React.FC<IConfigurationCategoryProps> = (props) => {
    return (
        <div className="configuration-category">
            <Typography tagName="h3">{props.categoryTitle}</Typography>
        </div>
    );
};
