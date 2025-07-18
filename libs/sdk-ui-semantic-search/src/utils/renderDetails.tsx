// (C) 2024-2025 GoodData Corporation

import {
    ISemanticSearchRelationship,
    ISemanticSearchResultItem,
    isSemanticSearchResultItem,
    ITheme,
} from "@gooddata/sdk-model";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, EllipsisText, Icon, Typography } from "@gooddata/sdk-ui-kit";
import classnames from "classnames";
import { ListItem } from "../types.js";

/**
 * Maximum number of lines for the description before ellipsis.
 */
const MAX_LINES = 7;
/**
 * Align points for the details bubble.
 */
const BUBBLE_ALIGN_POINTS = [{ align: "cl tr", offset: { x: 2, y: -4 } }];
/**
 * Arrow style for the details bubble.
 */
const ARROW_STYLE = { display: "none" };

/**
 * Render the tags if there are any.
 */
const renderTags = (item: ISemanticSearchResultItem) => {
    if (item.tags?.some((tag) => tag !== item.title)) {
        return (
            <React.Fragment>
                <FormattedMessage tagName="h4" id="semantic-search.tags" />
                <Typography tagName="p">{item.tags.join(", ")}</Typography>
            </React.Fragment>
        );
    }

    return null;
};

/**
 * Render the description if it is different from the title.
 */
const renderDescription = (item: ISemanticSearchResultItem) => {
    if (item.description && item.description !== item.title) {
        return <EllipsisText maxLines={MAX_LINES} text={item.description} />;
    }

    return null;
};

const renderScore = (item: ISemanticSearchResultItem) => {
    const score = item.score ? Math.round(Math.min(1, Math.max(0, item.score)) * 100) : 0;

    return (
        <div className="gd-semantic-search__results-item__details__contents__match">
            <hr />
            <FormattedMessage id="semantic-search.match" tagName="h4" values={{ score }} />
        </div>
    );
};

/**
 * Render the details of the item in a bubble.
 */
export const renderDetails = (
    listItem:
        | ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>
        | ListItem<ISemanticSearchRelationship, undefined>,
    theme?: ITheme,
    isActive?: boolean,
    isOpened?: boolean,
) => {
    if (isSemanticSearchResultItem(listItem.item)) {
        return (
            <div className="gd-semantic-search__results-item__details">
                <span
                    className={classnames("gd-semantic-search__results-item__details__info", {
                        "gd-semantic-search__results-item__details__info--active": isActive,
                    })}
                >
                    <BubbleHoverTrigger eventsOnBubble className="gd-semantic-search__bubble_trigger">
                        <Icon.QuestionMark color={theme?.palette?.complementary?.c7 ?? "#6D7680"} />
                        <Bubble
                            className="bubble-light gd-semantic-search__bubble"
                            alignPoints={BUBBLE_ALIGN_POINTS}
                            arrowStyle={ARROW_STYLE}
                        >
                            {/* It's OK to have div inline, as this chunk is rendered through portal */}
                            <div className="gd-semantic-search__results-item__details__contents">
                                <Typography tagName="h3">{listItem.item.title}</Typography>
                                {renderDescription(listItem.item)}
                                <FormattedMessage tagName="h4" id="semantic-search.id" />
                                <Typography tagName={"p"}>{listItem.item.id}</Typography>
                                {renderTags(listItem.item)}
                                {renderScore(listItem.item)}
                            </div>
                        </Bubble>
                    </BubbleHoverTrigger>
                </span>
                {listItem.parents?.length ? (
                    <div className="gd-semantic-search__results-item__details__results">
                        <FormattedMessage
                            tagName="div"
                            id="semantic-search.results"
                            values={{
                                count: listItem.parents.length,
                            }}
                        />
                        <div
                            className={classnames(
                                "gd-semantic-search__results-item__details__results__arrow",
                                {
                                    "gd-semantic-search__results-item__details__results__arrow--open":
                                        isOpened,
                                },
                            )}
                        >
                            <Icon.ArrowRight width={10} height={10} ariaHidden />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
    return <></>;
};
