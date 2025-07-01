// (C) 2024-2025 GoodData Corporation

import { ISemanticSearchResultItem, ITheme } from "@gooddata/sdk-model";
import { IIconProps, Icon, InsightIcon } from "@gooddata/sdk-ui-kit";
import React, { PropsWithChildren } from "react";
import { ListItem } from "../types.js";

/**
 * Pick an icon according to the item type.
 */
export const renderItemIcon = ({ item }: ListItem<ISemanticSearchResultItem>, theme?: ITheme) => {
    const props: IIconProps = { color: theme?.palette?.complementary?.c5 ?? "#B0BECA" };

    const Wrapper = ({ children }: PropsWithChildren) => {
        return (
            <span aria-label={item.type} role="img">
                {children}
            </span>
        );
    };

    switch (item.type) {
        case "dashboard":
            return (
                <Wrapper>
                    <Icon.Dashboard {...props} />
                </Wrapper>
            );
        case "visualization":
            return (
                <Wrapper>
                    <InsightIcon visualizationUrl={item.visualizationUrl} iconProps={props} />
                </Wrapper>
            );
        case "dataset":
            return (
                <Wrapper>
                    <Icon.Dataset {...props} />
                </Wrapper>
            );
        case "attribute":
            return (
                <Wrapper>
                    <Icon.Attribute {...props} />
                </Wrapper>
            );
        case "label":
            return (
                <Wrapper>
                    <Icon.Label {...props} />
                </Wrapper>
            );
        case "fact":
            return (
                <Wrapper>
                    <Icon.Fact {...props} />
                </Wrapper>
            );
        case "metric":
            return (
                <Wrapper>
                    <Icon.Metric {...props} />
                </Wrapper>
            );
        case "date":
            return (
                <Wrapper>
                    <Icon.Date {...props} />
                </Wrapper>
            );
        default:
            return exhaustiveCheck(item.type);
    }
};

const exhaustiveCheck = (type: never): never => {
    throw new Error(`Unknown item type: ${type}`);
};
