// (C) 2024-2025 GoodData Corporation

import { Fragment, useState } from "react";

import { FormattedMessage } from "react-intl";

import {
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    isSemanticSearchResultItem,
} from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, EllipsisText, Typography, UiIcon } from "@gooddata/sdk-ui-kit";

import * as styles from "../SearchItemDetailsStyles.module.scss.js";

/**
 * Maximum number of lines for the description before ellipsis.
 */
const MAX_LINES = 7;
/**
 * Align points for the details bubble.
 */
const BUBBLE_ALIGN_POINTS = [
    { align: "tr tl", offset: { x: 4, y: 4 } },
    { align: "tl tr", offset: { x: 4, y: 4 } },
];
/**
 * Arrow style for the details bubble.
 */
const ARROW_STYLE = { display: "none" };

type Props = {
    item: ISemanticSearchResultItem | ISemanticSearchRelationship;
};

/**
 * Render the details of the item in a bubble.
 * @internal
 */
export function SearchItemDetails({ item }: Props) {
    const [isHovered, setIsHovered] = useState(false);

    if (!isSemanticSearchResultItem(item)) {
        return null;
    }

    return (
        <div
            aria-hidden
            className={styles.details}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
        >
            <BubbleHoverTrigger eventsOnBubble className={styles.bubbleTrigger}>
                <UiIcon type="question" size={16} color={isHovered ? "complementary-7" : "complementary-6"} />
                <Bubble className="bubble-light" alignPoints={BUBBLE_ALIGN_POINTS} arrowStyle={ARROW_STYLE}>
                    {/* It's OK to have div inline, as this chunk is rendered through portal */}
                    <div className={styles.detailsContents}>
                        <Typography tagName="h3">{item.title}</Typography>
                        <Description item={item} />
                        <FormattedMessage tagName="h4" id="semantic-search.id" />
                        <Typography tagName={"p"}>{item.id}</Typography>
                        <Tags item={item} />
                        <Score item={item} />
                    </div>
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}

/**
 * Render the tags if there are any.
 */
function Tags({ item }: { item: ISemanticSearchResultItem }) {
    if (item.tags?.some((tag) => tag !== item.title)) {
        return (
            <Fragment>
                <FormattedMessage tagName="h4" id="semantic-search.tags" />
                <Typography tagName="p">{item.tags.join(", ")}</Typography>
            </Fragment>
        );
    }

    return null;
}

/**
 * Render the description if it is different from the title.
 */
function Description({ item }: { item: ISemanticSearchResultItem }) {
    if (item.description && item.description !== item.title) {
        return <EllipsisText maxLines={MAX_LINES} text={item.description} />;
    }

    return null;
}

function Score({ item }: { item: ISemanticSearchResultItem }) {
    const score = item.score ? Math.round(Math.min(1, Math.max(0, item.score)) * 100) : 0;

    return (
        <div className={styles.detailsMatch}>
            <hr />
            <FormattedMessage id="semantic-search.match" tagName="h4" values={{ score }} />
        </div>
    );
}
