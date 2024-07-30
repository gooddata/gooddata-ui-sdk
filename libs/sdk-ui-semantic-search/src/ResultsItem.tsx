// (C) 2024 GoodData Corporation

import * as React from "react";
import classnames from "classnames";
import { ISemanticSearchResultItemWithUrl } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, EllipsisText, Icon, Typography } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { FormattedMessage } from "react-intl";

export const ITEM_HEIGHT = 45;
const BUBBLE_ALIGN_POINTS = [{ align: "bc tr", offset: { x: 2, y: -4 } }];

/**
 * Props for the ResultsItem component.
 * @internal
 */
export type ResultsItemProps = {
    /**
     * The item to render.
     */
    item: ISemanticSearchResultItemWithUrl;
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
    active: boolean;
    /**
     * Callback to trigger when the item is hovered.
     */
    onHover: (item: ISemanticSearchResultItemWithUrl) => void;
    /**
     * Callback to trigger when the item is clicked.
     */
    onSelect: (item: ISemanticSearchResultItemWithUrl) => void;
};

/**
 * A single result item in the search results.
 * @internal
 */
export const ResultsItem: React.FC<ResultsItemProps> = ({ item, onHover, onSelect, active }) => {
    const theme = useTheme();
    const onMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Prevent multiple triggers
        if (e.target !== e.currentTarget) {
            return;
        }

        onHover(item);
    };

    const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onSelect(item);
    };

    const className = classnames({
        "gd-semantic-search__results-item": true,
        "gd-semantic-search__results-item--active": active,
    });

    // Use mouse enter with the target check instead of hover to prevent multiple triggers
    return (
        <a className={className} onMouseEnter={onMouseEnter} onClick={onClick} href={item.url}>
            <span className="gd-semantic-search__results-item__icon">{renderItemIcon(item)}</span>
            <span className="gd-semantic-search__results-item__text">{item.title}</span>
            <span className="gd-semantic-search__results-item__details">
                <BubbleHoverTrigger eventsOnBubble>
                    <Icon.QuestionMark color={theme?.palette?.complementary?.c7 ?? "#6D7680"} />
                    <Bubble
                        className="bubble-light gd-semantic-search__bubble"
                        alignPoints={BUBBLE_ALIGN_POINTS}
                        arrowStyle={{ display: "none" }}
                    >
                        {/* It's OK to have div inline, as this chunk is rendered through portal */}
                        <div className="gd-semantic-search__results-item__details__contents">
                            <Typography tagName="h3">{item.title}</Typography>
                            {renderIfHasDescription(item)}
                            <FormattedMessage tagName="h4" id="semantic-search.id" />
                            <Typography tagName={"p"}>{item.id}</Typography>
                        </div>
                    </Bubble>
                </BubbleHoverTrigger>
            </span>
        </a>
    );
};

/**
 * Render the description if it is different from the title.
 */
const renderIfHasDescription = (item: ISemanticSearchResultItemWithUrl) => {
    if (item.description && item.description !== item.title) {
        return <EllipsisText maxLines={7} text={item.description} />;
    }

    return null;
};

/**
 * Pick an icon according to the item type.
 */
const renderItemIcon = (item: ISemanticSearchResultItemWithUrl) => {
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
