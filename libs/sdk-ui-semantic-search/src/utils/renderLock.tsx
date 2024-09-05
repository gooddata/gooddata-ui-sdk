// (C) 2024 GoodData Corporation
import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { Icon } from "@gooddata/sdk-ui-kit";
import { ListItem } from "../types.js";

export const renderLock = (listItem: ListItem<ISemanticSearchResultItem>) => {
    if (!listItem.isLocked) return null;

    return <Icon.Lock className="gd-semantic-search__results-item__text__lock-icon" />;
};
