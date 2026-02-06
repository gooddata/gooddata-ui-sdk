// (C) 2025-2026 GoodData Corporation

import { Suspense, lazy } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { UiIcon } from "@gooddata/sdk-ui-kit";

import { MarkdownComponent } from "./Markdown.js";
import { replaceLinks } from "./replaceLinks.js";
import { type SemanticSearchContents } from "../../../model.js";

const SemanticSearchTreeView = lazy(() =>
    import("./SemanticSearchTreeView.js").then((module) => ({
        default: module.SemanticSearchTreeView,
    })),
);

const SEMANTIC_SEARCH_TREE_VIEW_HEIGHT = 300 + 2;

type Props = {
    content: SemanticSearchContents;
    useMarkdown?: boolean;
};

const hasSearchResults = (content: SemanticSearchContents): boolean => content.searchResults.length > 0;

export function SemanticSearchContentsComponent({ content, useMarkdown }: Props) {
    const workspace = useWorkspaceStrict();

    // Keeping for backwards compatibility
    const text = replaceLinks(content.text, content.searchResults, workspace);
    const showSearchUI = hasSearchResults(content);

    return (
        <div
            className={cx(
                "gd-gen-ai-chat__messages__content",
                showSearchUI && "gd-gen-ai-chat__messages__content--semantic-search",
            )}
        >
            <MarkdownComponent allowMarkdown={useMarkdown}>{text}</MarkdownComponent>
            {showSearchUI ? (
                <>
                    <div className="gd-gen-ai-chat__messages__semantic-search-header">
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
                </>
            ) : null}
        </div>
    );
}

/**
 * The fallback component for the semantic search tree view ensures that the correct height is set while loading.
 */
function SemanticSearchTreeViewFallback() {
    return <div style={{ height: SEMANTIC_SEARCH_TREE_VIEW_HEIGHT }} />;
}
