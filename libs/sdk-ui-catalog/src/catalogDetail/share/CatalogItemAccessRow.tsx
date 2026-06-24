// (C) 2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { UiSkeleton } from "@gooddata/sdk-ui-kit";

import { CatalogDetailContentRow } from "../CatalogDetailContentRow.js";

import { CatalogDetailAccessRow } from "./CatalogDetailAccessRow.js";
import { useCatalogItemShareActions, useCatalogItemShareState } from "./CatalogItemShareProvider.js";

/**
 * Inline access row for the metadata tab, wired to the share context. Renders the
 * current access summary, or a placeholder while it loads (the row stays because
 * Share is still reachable for the object), or nothing when sharing is unavailable.
 * Self-subscribing so it re-renders on access edits without re-rendering the tab.
 *
 * @internal
 */
export function CatalogItemAccessRow() {
    const { active, controller } = useCatalogItemShareState();
    const { open } = useCatalogItemShareActions();

    if (!active || !controller) {
        return null;
    }

    const summary = controller.state.summary;
    if (summary) {
        return <CatalogDetailAccessRow summary={summary} onOpen={open} />;
    }
    // Summary not available yet (loading or load error). Keep the row — Share is
    // still reachable — with a placeholder rather than omitting it.
    return (
        <CatalogDetailContentRow
            title={<FormattedMessage id="analyticsCatalog.share.access.row.label" />}
            content={<UiSkeleton itemWidth={200} itemHeight={20} />}
        />
    );
}
