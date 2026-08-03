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
    selfRestrictTitle: { id: "objectShare.selfRestrict.title" },
    /**
     * Single source for the self-restriction warning: shown as the confirm dialog
     * body AND as the disabled-option tooltip in the self row's permission menu —
     * the copy must stay identical in both places by design.
     */
    selfRestrictWarning: { id: "objectShare.selfRestrict.warning" },
    /**
     * Disabled-option tooltip on the workspace rule's permission menu for levels
     * below an inherited workspace-wide grant, which they could never lower.
     */
    workspaceLevelInherited: { id: "objectShare.workspaceLevel.inherited" },
    granteeYou: { id: "objectShare.grantee.you" },
    adminTagLabel: { id: "objectShare.adminTag.label" },
    adminTagTooltip: { id: "objectShare.adminTag.tooltip" },
    toastGranteeAdded: { id: "objectShare.toast.granteeAdded" },
    toastAccessUpdated: { id: "objectShare.toast.accessUpdated" },
    toastGeneralAccessUpdated: { id: "objectShare.toast.generalAccessUpdated" },
    toastError: { id: "objectShare.toast.error" },
    toastLabelScopePartial: { id: "objectShare.toast.labelScopePartial" },
    loadError: { id: "objectShare.loadError" },
});
