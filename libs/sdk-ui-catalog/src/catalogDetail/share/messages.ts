// (C) 2026 GoodData Corporation

import { defineMessages } from "react-intl";

/**
 * Strings owned by the catalog detail share launcher + inline access row.
 * Dialog/confirm/toast strings are owned by `@gooddata/sdk-ui-ext` under the
 * `objectShare.*` namespace.
 */
export const shareMessages = defineMessages({
    shareButton: { id: "analyticsCatalog.share.button" },
    accessRowLabel: { id: "analyticsCatalog.share.access.row.label" },
    accessRowRestricted: { id: "analyticsCatalog.share.access.row.restricted" },
    accessRowWorkspaceView: { id: "analyticsCatalog.share.access.row.workspace.view" },
    accessRowWorkspaceShare: { id: "analyticsCatalog.share.access.row.workspace.share" },
    accessRowSharedWith: { id: "analyticsCatalog.share.access.row.sharedWith" },
});

/**
 * Strings for the labels summary + read-only labels popup in the detail header.
 */
export const labelsMessages = defineMessages({
    more: { id: "analyticsCatalog.labels.more" },
    triggerAriaLabel: { id: "analyticsCatalog.labels.trigger.ariaLabel" },
    popupTitle: { id: "analyticsCatalog.labels.popup.title" },
    popupClose: { id: "analyticsCatalog.labels.popup.close" },
});
