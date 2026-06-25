// (C) 2022-2026 GoodData Corporation

import { defineMessages } from "react-intl";

//NOTE: Follow-up ticket for move all messages: https://gooddata.atlassian.net/browse/FET-1050

export const dialogHeadlineLabels = defineMessages({
    embedInsight: { id: "embedInsightDialog.headLine.embedInsight" },
});

export const dialogChangeMessageLabels = defineMessages({
    definition: { id: "embedInsightDialog.componentType.byDefinition.tooltip" },
    reference: { id: "embedInsightDialog.componentType.byReference.tooltip" },
    customTitle: { id: "embedInsightDialog.webComponents.customTitle.tooltip" },
    disabledCustomTitle: { id: "embedInsightDialog.webComponents.customTitle.disabled.tooltip" },
    locale: { id: "embedInsightDialog.webComponents.locale.tooltip" },
});

export const dialogEmptyInsightMessageLabels = defineMessages({
    reference: { id: "embedInsightDialog.emptyInsight.byReference" },
    definition: { id: "embedInsightDialog.emptyInsight.byDefinition" },
});

export const dialogEmbedTabLabels = defineMessages({
    react: { id: "embedDialog.tab.react" },
    webComponents: { id: "embedDialog.tab.webComponents" },
});

export const granularPermissionMessageLabels = defineMessages({
    EDIT: { id: "shareDialog.share.granular.grantee.permission.edit" },
    VIEW: { id: "shareDialog.share.granular.grantee.permission.view" },
    SHARE: { id: "shareDialog.share.granular.grantee.permission.share" },
    remove: { id: "shareDialog.share.granular.grantee.permission.remove" },
});

export const granularPermissionMessageTooltips = defineMessages({
    cannotChangeHigherForUser: { id: "shareDialog.share.granular.granularUser.tooltip.cannotChangeHigher" },
    cannotChangeHigherForGroup: {
        id: "shareDialog.share.granular.granularGroup.tooltip.cannotChangeHigher",
    },
    cannotRemoveFromParentForUser: {
        id: "shareDialog.share.granular.granularUser.tooltip.cannotRemoveFromParent",
    },
    cannotRemoveFromParentForGroup: {
        id: "shareDialog.share.granular.granularGroup.tooltip.cannotRemoveFromParent",
    },
    noChangeAvailableForUser: { id: "shareDialog.share.granular.granularUser.tooltip.noChangeAvailable" },
    noChangeAvailableForGroup: { id: "shareDialog.share.granular.granularGroup.tooltip.noChangeAvailable" },
    cannotGrantHigher: { id: "shareDialog.share.granular.grantee.tooltip.cannotGrantHigher" },
    cannotGrantLowerForUser: { id: "shareDialog.share.granular.granularUser.tooltip.cannotGrantLower" },
    cannotGrantLowerForGroup: { id: "shareDialog.share.granular.granularGroup.tooltip.cannotGrantLower" },
});

export const commonDialogMessages = defineMessages({
    apply: { id: "apply" },
    cancel: { id: "cancel" },
    close: { id: "close" },
});

export const olpGranteeAvatarMessages = defineMessages({
    user: { id: "shareDialog.olp.granteeAvatar.user" },
    group: { id: "shareDialog.olp.granteeAvatar.group" },
});

export const olpGranteeRowMessages = defineMessages({
    ownerTag: { id: "shareDialog.olp.granteeRow.ownerTag" },
});

export const olpObjectShareDialogMessages = defineMessages({
    title: { id: "shareDialog.olp.objectShareDialog.title" },
    sharedWith: { id: "shareDialog.olp.objectShareDialog.sharedWith" },
    add: { id: "shareDialog.olp.objectShareDialog.add" },
    generalAccess: { id: "shareDialog.olp.objectShareDialog.generalAccess" },
});

export const olpAddGranteeDialogMessages = defineMessages({
    back: { id: "shareDialog.olp.addGranteeDialog.back" },
    userOrGroup: { id: "shareDialog.olp.addGranteeDialog.userOrGroup" },
    searchPlaceholder: { id: "shareDialog.olp.addGranteeDialog.searchPlaceholder" },
    emptyState: { id: "shareDialog.olp.addGranteeDialog.emptyState" },
    add: { id: "shareDialog.olp.addGranteeDialog.add" },
});

export const olpGeneralAccessMessages = defineMessages({
    groupLabel: { id: "shareDialog.olp.generalAccess.groupLabel" },
    restrictedTitle: { id: "shareDialog.olp.generalAccess.restricted.title" },
    restrictedDescription: { id: "shareDialog.olp.generalAccess.restricted.description" },
    workspaceTitle: { id: "shareDialog.olp.generalAccess.workspace.title" },
    workspaceDescription: { id: "shareDialog.olp.generalAccess.workspace.description" },
});

export const olpLabelMessages = defineMessages({
    suffixPrimary: { id: "shareDialog.olp.label.suffix.primary" },
    suffixDefault: { id: "shareDialog.olp.label.suffix.default" },
    listHeading: { id: "shareDialog.olp.labels.heading" },
    popoverTitle: { id: "shareDialog.olp.labels.popoverTitle" },
    backAriaLabel: { id: "shareDialog.olp.labels.back" },
});

export const olpPermissionMessages = defineMessages({
    canViewAndShare: { id: "shareDialog.share.granular.grantee.permission.share" },
    canView: { id: "shareDialog.share.granular.grantee.permission.view" },
    canEdit: { id: "shareDialog.olp.permission.edit" },
    canViewAndShareTooltip: { id: "shareDialog.olp.permission.tooltip.share" },
    canViewTooltip: { id: "shareDialog.olp.permission.tooltip.view" },
    transferOwnership: { id: "shareDialog.olp.permission.transferOwnership" },
    labels: { id: "shareDialog.olp.permission.labels" },
    removeAccess: { id: "shareDialog.olp.permission.removeAccess" },
    menuLabel: { id: "shareDialog.olp.permission.menuLabel" },
    moreInfoAriaLabel: { id: "shareDialog.olp.permission.moreInfoAriaLabel" },
    moreOptionsAriaLabel: { id: "shareDialog.olp.permission.moreOptions.ariaLabel" },
    moreOptionsMenuLabel: { id: "shareDialog.olp.permission.moreOptions.menuLabel" },
    effectivePermissionTooltipShare: { id: "shareDialog.olp.permission.effective.tooltip.share" },
    effectivePermissionAriaLabel: { id: "shareDialog.olp.permission.effective.ariaLabel" },
});

export const uiAutocompleteMessages = defineMessages({
    searchPlaceholder: { id: "uiKit.autocomplete.searchPlaceholder" },
    stateLoading: { id: "uiKit.autocomplete.stateLoading" },
    stateError: { id: "uiKit.autocomplete.stateError" },
    stateNoMatch: { id: "uiKit.autocomplete.stateNoMatch" },
    loadMore: { id: "uiKit.autocomplete.loadMore" },
});

export const uiGranteeAsyncPickerMessages = defineMessages({
    searchPlaceholder: { id: "shareDialog.share.grantee.add.search.placeholder" },
    sectionGroups: { id: "shareDialog.share.grantee.add.label.group" },
    sectionUsers: { id: "shareDialog.share.grantee.add.label.user" },
    stateError: { id: "shareDialog.share.grantee.add.search.error.message" },
    stateNoMatch: { id: "shareDialog.share.grantee.add.search.no.matching.items" },
});
