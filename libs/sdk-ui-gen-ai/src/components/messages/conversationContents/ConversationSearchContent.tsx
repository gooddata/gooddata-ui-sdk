// (C) 2024-2026 GoodData Corporation

import { Suspense, lazy, useMemo } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type ISemanticSearchRelationship, type ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiIcon } from "@gooddata/sdk-ui-kit";

const SemanticSearchTreeView = lazy(() =>
    import("../components/SemanticSearchTreeView.js").then((module) => ({
        default: module.SemanticSearchTreeView,
    })),
);

const SEMANTIC_SEARCH_TREE_VIEW_HEIGHT = 300 + 2;

export type ConversationSearchContentProps = {
    useMarkdown?: boolean;
    className?: string;
    results: ISemanticSearchResultItem[];
    relationships: ISemanticSearchRelationship[];
    keywords: string[];
};

export function ConversationSearchContent({
    className,
    results,
    relationships,
}: ConversationSearchContentProps) {
    const classNames = cx(
        "gd-gen-ai-chat__conversation__item__content",
        "gd-gen-ai-chat__conversation__item__content--search",
        className,
    );
    const workspace = useWorkspaceStrict();
    const showSearchUI = results.length > 0;

    const content = useMemo(
        () => ({
            type: "semanticSearch" as const,
            text: "",
            searchResults: results,
            relationships: relationships,
        }),
        [results, relationships],
    );

    // No results, no search UI
    if (!showSearchUI) {
        return null;
    }

    return (
        <div className={classNames}>
            <div className="gd-gen-ai-chat__conversation__item__content-search-header">
                <UiIcon
                    type="search"
                    size={14}
                    color="complementary-6"
                    backgroundSize={26}
                    backgroundColor="complementary-2"
                />
                <FormattedMessage id="gd.gen-ai.semantic-search.title" />
            </div>
            <Suspense fallback={<SemanticSearchTreeViewFallback />}>
                <SemanticSearchTreeView
                    workspace={workspace}
                    content={content}
                    maxHeight={SEMANTIC_SEARCH_TREE_VIEW_HEIGHT}
                />
            </Suspense>
        </div>
    );
}

/**
 * The fallback component for the semantic search tree view ensures that the correct height is set while loading.
 */
function SemanticSearchTreeViewFallback() {
    return <div style={{ height: SEMANTIC_SEARCH_TREE_VIEW_HEIGHT }} />;
}
