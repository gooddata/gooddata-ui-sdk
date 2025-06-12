// (C) 2022 GoodData Corporation
import { Typography } from "@gooddata/sdk-ui-kit";
import React from "react";

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
