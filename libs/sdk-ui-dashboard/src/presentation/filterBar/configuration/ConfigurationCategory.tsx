// (C) 2023-2025 GoodData Corporation
import { Typography } from "@gooddata/sdk-ui-kit";

interface IConfigurationCategoryProps {
    categoryTitle: string;
}

export function ConfigurationCategory({ categoryTitle }: IConfigurationCategoryProps) {
    return (
        <div className="configuration-category">
            <Typography tagName="h3">{categoryTitle}</Typography>
        </div>
    );
}
