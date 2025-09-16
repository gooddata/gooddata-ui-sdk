// (C) 2022-2025 GoodData Corporation

import { Typography } from "@gooddata/sdk-ui-kit";

interface IConfigurationCategoryProps {
    categoryTitle: string;
}

export function ConfigurationCategory(props: IConfigurationCategoryProps) {
    return (
        <div className="configuration-category">
            <Typography tagName="h3">{props.categoryTitle}</Typography>
        </div>
    );
}
