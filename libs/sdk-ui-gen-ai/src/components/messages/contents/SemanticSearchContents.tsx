// (C) 2025 GoodData Corporation

import { Suspense, lazy } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { MarkdownComponent } from "./Markdown.js";
import { replaceLinks } from "./replaceLinks.js";
import { type SemanticSearchContents } from "../../../model.js";

const SemanticSearchTreeView = lazy(() =>
    import("./SemanticSearchTreeView.js").then((module) => ({
        default: module.SemanticSearchTreeView,
    })),
);

type Props = {
    content: SemanticSearchContents;
    useMarkdown?: boolean;
};

export function SemanticSearchContentsComponent({ content, useMarkdown }: Props) {
    const intl = useIntl();
    const workspace = useWorkspaceStrict();

    // Keeping for backwards compatibility
    const text = replaceLinks(content.text, content.searchResults, workspace);

    return (
        <div
            className={cx(
                "gd-gen-ai-chat__messages__content",
                "gd-gen-ai-chat__messages__content--semantic-search",
            )}
        >
            <MarkdownComponent allowMarkdown={useMarkdown}>{text}</MarkdownComponent>
            <Suspense fallback={null}>
                <SemanticSearchTreeView workspace={workspace} content={content} locale={intl.locale} />
            </Suspense>
        </div>
    );
}
