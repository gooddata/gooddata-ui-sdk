// (C) 2024 GoodData Corporation

import * as React from "react";
import classnames from "classnames";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { Icon, Typography } from "@gooddata/sdk-ui-kit";

export const ITEM_HEIGHT = 45;

/**
 * Props for the ResultsItem component.
 * @internal
 */
export type ResultsItemProps = {
    /**
     * The item to render.
     */
    item: ISemanticSearchResultItem;
    /**
     * The height of the item.
     */
    height: number;
    /**
     * The width of the item.
     */
    width: number;
    /**
     * Whether the item is selected.
     */
    selected: boolean;
    /**
     * Callback to trigger when the item is hovered.
     */
    onHover: () => void;
    /**
     * Callback to trigger when the item is clicked.
     */
    onClick: () => void;
};

/**
 * A single result item in the search results.
 * @internal
 */
export const ResultsItem: React.FC<ResultsItemProps> = ({ item, onHover, onClick, selected }) => {
    const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent multiple triggers
        if (e.target !== e.currentTarget) {
            return;
        }

        onHover();
    };

    const className = classnames({
        "gd-semantic-search__results-item": true,
        "gd-semantic-search__results-item--selected": selected,
    });

    // Use mouse enter with the target check instead of hover to prevent multiple triggers
    // Use mouse down instead of click to prevent the dialog from disappearing before the click event is caught
    return (
        <div className={className} onMouseEnter={onMouseEnter} onMouseDown={onClick}>
            <div className="gd-semantic-search__results-item__icon">{renderItemIcon(item)}</div>
            <div className="gd-semantic-search__results-item__text">
                <Typography tagName="p">{item.title}</Typography>
            </div>
        </div>
    );
};

/**
 * Pick an icon according to the item type.
 */
const renderItemIcon = (item: ISemanticSearchResultItem) => {
    switch (item.type) {
        case "dashboard":
            return <Icon.Dashboard />;
        case "visualization":
            return <Icon.Insight />;
        case "dataset":
            return <Icon.Dataset />;
        case "attribute":
            return <Icon.Attribute />;
        case "label":
            return <Icon.Label />;
        case "fact":
            return <Icon.Fact />;
        case "metric":
            return <Icon.Metric />;
        case "date":
            return <Icon.Date />;
        default:
            return null;
    }
};
