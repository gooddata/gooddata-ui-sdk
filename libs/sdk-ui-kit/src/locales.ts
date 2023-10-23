// (C) 2022-2023 GoodData Corporation
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

export const workspacePermissionMessageLabels= defineMessages({
    VIEW: { id: "userGroupDialog.workspace.permission.view" },
    VIEW_AND_EXPORT: { id: "userGroupDialog.workspace.permission.viewExport" },
    ANALYZE: { id: "userGroupDialog.workspace.permission.analyze" },
    ANALYZE_AND_EXPORT: { id: "userGroupDialog.workspace.permission.analyzeExport" },
    MANAGE: { id: "userGroupDialog.workspace.permission.manage" },
    remove: { id: "userGroupDialog.workspace.permission.remove" },
});

export const workspacePermissionTooltipMessageLabels= defineMessages({
    VIEW: { id: "userGroupDialog.workspace.permission.view.tooltip" },
    VIEW_AND_EXPORT: { id: "userGroupDialog.workspace.permission.viewExport.tooltip" },
    ANALYZE: { id: "userGroupDialog.workspace.permission.analyze.tooltip" },
    ANALYZE_AND_EXPORT: { id: "userGroupDialog.workspace.permission.analyzeExport.tooltip" },
    MANAGE: { id: "userGroupDialog.workspace.permission.manage.tooltip" },
});

export const userDialogTabsMessageLabels = defineMessages({
    workspaces: { id: "userGroupDialog.tab.workspaces" },
    groups: { id: "userGroupDialog.tab.groups" },
    details: { id: "userGroupDialog.tab.details" },
});

export const userDialogMessageLabels = defineMessages({
    grantedWorkspaceRemovedSuccess: { id: "userGroupDialog.workspace.removeSuccess" },
    grantedWorkspaceRemovedError: { id: "userGroupDialog.workspace.removeError" },
    grantedWorkspaceAddedSuccess: { id: "userGroupDialog.workspace.addSuccess" },
    grantedWorkspaceAddedError: { id: "userGroupDialog.workspace.addError" },
    grantedWorkspaceChangeSuccess: { id: "userGroupDialog.workspace.changeSuccess" },
    grantedWorkspaceChangeError: { id: "userGroupDialog.workspace.changeError" },
    detailsUpdatedSuccess: { id: "userGroupDialog.workspace.detailsUpdatedSuccess" },
    detailsUpdatedError: { id: "userGroupDialog.workspace.detailsUpdatedError" },
    grantedGroupAddedSuccess: { id: "userGroupDialog.group.addSuccess" },
    grantedGroupAddedError: { id: "userGroupDialog.group.addError" },
    grantedGroupRemovedSuccess: { id: "userGroupDialog.group.removeSuccess" },
    grantedGroupRemovedError: { id: "userGroupDialog.group.removeError" },
    userRemovedSuccess: { id: "userGroupDialog.deleteUser.success" },
    userRemovedError: { id: "userGroupDialog.deleteUser.failure" },
});

export const hierarchicalPermissionMessageLabels = defineMessages({
    enabled: { id: "userGroupDialog.workspace.hierarchicalPermission.yes" },
    disabled: { id: "userGroupDialog.workspace.hierarchicalPermission.no" },
});

export const hierarchicalPermissionTooltipMessageLabels = defineMessages({
    enabled: { id: "userGroupDialog.workspace.hierarchicalPermission.yes.tooltip" },
    disabled: { id: "userGroupDialog.workspace.hierarchicalPermission.no.tooltip" },
});
