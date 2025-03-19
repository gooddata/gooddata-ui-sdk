// (C) 2024 GoodData Corporation

import { ISemanticSearchResultItem, ITheme } from "@gooddata/sdk-model";
import { IIconProps, Icon, InsightIcon } from "@gooddata/sdk-ui-kit";
import React from "react";
import { ListItem } from "../types.js";

/**
 * Pick an icon according to the item type.
 */
export const renderItemIcon = ({ item }: ListItem<ISemanticSearchResultItem>, theme?: ITheme) => {
    const props: IIconProps = { color: theme?.palette?.complementary?.c5 ?? "#B0BECA" };

    switch (item.type) {
        case "dashboard":
            return <Icon.Dashboard {...props} />;
        case "visualization":
            return <InsightIcon visualizationUrl={item.visualizationUrl} iconProps={props} />;
        case "dataset":
            return <Icon.Dataset {...props} />;
        case "attribute":
            return <Icon.Attribute {...props} />;
        case "label":
            return <Icon.Label {...props} />;
        case "fact":
            return <Icon.Fact {...props} />;
        case "metric":
            return <Icon.Metric {...props} />;
        case "date":
            return <Icon.Date {...props} />;
        default:
            return exhaustiveCheck(item.type);
    }
};

const exhaustiveCheck = (type: never): never => {
    throw new Error(`Unknown item type: ${type}`);
};
