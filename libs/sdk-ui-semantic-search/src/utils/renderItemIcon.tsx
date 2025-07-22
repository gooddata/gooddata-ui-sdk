// (C) 2024-2025 GoodData Corporation

import {
    ISemanticSearchRelationship,
    ISemanticSearchResultItem,
    isSemanticSearchResultItem,
    ITheme,
} from "@gooddata/sdk-model";
import { IIconProps, Icon, InsightIcon } from "@gooddata/sdk-ui-kit";
import React, { PropsWithChildren } from "react";
import { ListItem } from "../types.js";

/**
 * Pick an icon according to the item type.
 */
export const renderItemIcon = (
    {
        item,
    }:
        | ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>
        | ListItem<ISemanticSearchRelationship, undefined>,
    theme?: ITheme,
) => {
    const props: IIconProps = { color: theme?.palette?.complementary?.c5 ?? "#B0BECA", ariaHidden: true };

    const type = isSemanticSearchResultItem(item) ? item.type : item.sourceObjectType;
    const visualizationUrl = isSemanticSearchResultItem(item) ? item.visualizationUrl : null;

    const Wrapper = ({ children }: PropsWithChildren) => {
        return (
            <span aria-label={type} role="img">
                {children}
            </span>
        );
    };

    switch (type) {
        case "dashboard":
            return (
                <Wrapper>
                    <Icon.Dashboard {...props} />
                </Wrapper>
            );
        case "visualization":
            return (
                <Wrapper>
                    {visualizationUrl ? (
                        <InsightIcon visualizationUrl={visualizationUrl} iconProps={props} />
                    ) : (
                        <Icon.NewVisualization {...props} />
                    )}
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
            return exhaustiveCheck(type);
    }
};

const exhaustiveCheck = (type: never): never => {
    throw new Error(`Unknown item type: ${type}`);
};
