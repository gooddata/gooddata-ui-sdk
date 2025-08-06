// (C) 2024-2025 GoodData Corporation
import React from "react";
import {
    isSemanticSearchResultItem,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
} from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { IIconProps, Icon, UiIcon, InsightIcon, type IconType } from "@gooddata/sdk-ui-kit";

type Props = {
    item: ISemanticSearchResultItem | ISemanticSearchRelationship;
    icon?: IconType;
};

/**
 * Pick an icon according to the item type.
 */
export function SearchItemIcon({ item, icon }: Props) {
    const theme = useTheme();

    if (icon) {
        return <UiIcon type={icon} color="complementary-5" />;
    }

    const props: IIconProps = {
        color: theme?.palette?.complementary?.c5 ?? "#B0BECA",
        ariaHidden: true,
    };
    const type = isSemanticSearchResultItem(item) ? item.type : item.sourceObjectType;
    const visualizationUrl = isSemanticSearchResultItem(item) ? item.visualizationUrl : undefined;

    return (
        <div aria-label={type} role="img">
            {(() => {
                switch (type) {
                    case "dashboard":
                        return <Icon.Dashboard {...props} />;
                    case "visualization":
                        return <InsightIcon visualizationUrl={visualizationUrl} iconProps={props} />;
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
                        return exhaustiveCheck(type);
                }
            })()}
        </div>
    );
}

const exhaustiveCheck = (type: never): never => {
    throw new Error(`Unknown item type: ${type}`);
};
