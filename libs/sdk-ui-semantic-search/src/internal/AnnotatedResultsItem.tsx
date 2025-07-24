// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { ListItemProps } from "../types.js";
import { renderDetails } from "../utils/renderDetails.js";
import { renderItemIcon } from "../utils/renderItemIcon.js";
import { UpdatedDate } from "./UpdateDate.js";
import { renderLock } from "../utils/renderLock.js";
import { SearchListItem } from "../SearchListItem.js";
import { getAreaLabel } from "../utils/getAreaLabel.js";

const CoreAnnotatedResultsItem: React.FC<
    ListItemProps<ISemanticSearchResultItem, ISemanticSearchRelationship>
> = (props) => {
    const { listItem } = props;
    const lockIcon = renderLock(listItem.data);

    return (
        <SearchListItem
            {...props}
            renderIcon={renderItemIcon}
            renderDetails={renderDetails}
            getAreaLabel={getAreaLabel}
            renderItem={(item) => (
                <>
                    <span className="gd-semantic-search__results-item__text__row">
                        {lockIcon}
                        <span className="gd-semantic-search__results-item__text__ellipsis">
                            {item.item.title}
                        </span>
                    </span>
                    <span className="gd-semantic-search__results-item__text__row">
                        <span>
                            <UpdatedDate listItem={item} />
                        </span>
                    </span>
                </>
            )}
            renderSubItem={(item) => <>{item.item.sourceObjectTitle}</>}
        />
    );
};

/**
 * A single result item in the search results.
 * @internal
 */
export const AnnotatedResultsItem = React.memo(CoreAnnotatedResultsItem);
