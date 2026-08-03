// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "../CatalogDetailContentRow.js";

import { CatalogDetailAccessRow } from "./CatalogDetailAccessRow.js";
import { useCatalogItemShareActions, useCatalogItemShareState } from "./CatalogItemShareProvider.js";
import { shareMessages } from "./messages.js";

/**
 * Inline access row for the metadata tab, wired to the share context. Renders the
 * current access summary, a placeholder while it loads, or an error note when the
 * summary fetch failed (the row stays in both cases because Share is still
 * reachable for the object — opening the dialog fetches again and fills the
 * summary in). Renders nothing when sharing is unavailable. Self-subscribing so
 * it re-renders on access edits without re-rendering the tab.
 *
 * @internal
 */
export function CatalogItemAccessRow() {
    const { active, summary, summaryError } = useCatalogItemShareState();
    const { open } = useCatalogItemShareActions();

    if (!active) {
        return null;
    }

    if (summary) {
        return <CatalogDetailAccessRow summary={summary} onOpen={open} />;
    }
    return (
        <CatalogDetailContentRow
            title={<FormattedMessage {...shareMessages.accessRowLabel} />}
            content={
                summaryError ? (
                    // role="alert": the error replaces the skeleton after an async
                    // failure — it must be announced, not just inserted.
                    <span role="alert">
                        <FormattedMessage {...shareMessages.accessRowError} />
                    </span>
                ) : (
                    <UiSkeleton itemWidth={200} itemHeight={20} />
                )
            }
        />
    );
}
