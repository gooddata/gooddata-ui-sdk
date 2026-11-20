// (C) 2026 GoodData Corporation

import { createContext } from "react";

import {
    type GenAIObjectType,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
    isSemanticSearchResultItem,
} from "@gooddata/sdk-model";

export type SearchLinkPolicy = (type: GenAIObjectType) => boolean;

export const SearchLinkPolicyContext = createContext<SearchLinkPolicy | undefined>(undefined);

export function isSearchItemLinkEnabled(
    data: ISemanticSearchResultItem | ISemanticSearchRelationship,
    isLinkEnabled?: SearchLinkPolicy,
): boolean {
    return isLinkEnabled?.(isSemanticSearchResultItem(data) ? data.type : data.sourceObjectType) !== false;
}
