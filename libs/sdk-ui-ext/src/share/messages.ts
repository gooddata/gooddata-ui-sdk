// (C) 2026 GoodData Corporation

import { defineMessages } from "react-intl";

/**
 * Messages owned by the connected `ObjectShareDialog` and its hooks. Strings
 * for the consumer's launcher button or inline access row live in the
 * consumer's own bundle (see e.g. `analyticsCatalog.share.*` in
 * `@gooddata/sdk-ui-catalog`).
 *
 * @internal
 */
export const objectShareMessages = defineMessages({
    confirmRestrictTitle: { id: "objectShare.confirm.restrict.title" },
    confirmRestrictDescription: { id: "objectShare.confirm.restrict.description" },
    confirmGrantWorkspaceTitle: { id: "objectShare.confirm.grantWorkspace.title" },
    confirmGrantWorkspaceDescription: { id: "objectShare.confirm.grantWorkspace.description" },
    confirmButton: { id: "objectShare.confirm.button" },
    toastGranteeAdded: { id: "objectShare.toast.granteeAdded" },
    toastAccessUpdated: { id: "objectShare.toast.accessUpdated" },
    toastGeneralAccessUpdated: { id: "objectShare.toast.generalAccessUpdated" },
    toastError: { id: "objectShare.toast.error" },
    toastLabelScopePartial: { id: "objectShare.toast.labelScopePartial" },
    loadError: { id: "objectShare.loadError" },
});
