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

export const userManagementWorkspacePermissionMessages = defineMessages({
    VIEW: { id: "userManagement.workspace.permission.view" },
    VIEW_AND_EXPORT: { id: "userManagement.workspace.permission.viewExport" },
    ANALYZE: { id: "userManagement.workspace.permission.analyze" },
    ANALYZE_AND_EXPORT: { id: "userManagement.workspace.permission.analyzeExport" },
    MANAGE: { id: "userManagement.workspace.permission.manage" },
    remove: { id: "userManagement.workspace.permission.remove" },
});

export const userManagementWorkspacePermissionTooltipMessages = defineMessages({
    VIEW: { id: "userManagement.workspace.permission.view.tooltip" },
    VIEW_AND_EXPORT: { id: "userManagement.workspace.permission.viewExport.tooltip" },
    ANALYZE: { id: "userManagement.workspace.permission.analyze.tooltip" },
    ANALYZE_AND_EXPORT: { id: "userManagement.workspace.permission.analyzeExport.tooltip" },
    MANAGE: { id: "userManagement.workspace.permission.manage.tooltip" },
});

export const userDialogTabsMessageLabels = defineMessages({
    workspaces: { id: "userManagement.tab.workspaces" },
    userGroups: { id: "userManagement.tab.groups" },
    details: { id: "userManagement.tab.details" },
});

export const userGroupDialogTabsMessageLabels = defineMessages({
    workspaces: { id: "userManagement.tab.workspaces" },
    users: { id: "userManagement.tab.users" },
    details: { id: "userManagement.tab.details" },
});

export const userManagementMessages = defineMessages({
    createUserGroupDialogTitle: { id: "userManagement.createUserGroup.dialogTitle" },
    createUserGroupButton: { id: "userManagement.createUserGroup.createButton" },
    cancelUserGroupButton: { id: "userManagement.createUserGroup.cancelButton" },
    createUserGroupInputPlaceholder: { id: "userManagement.createUserGroup.inputPlaceholder" },
    userGroupDeleteSuccess: { id: "userManagement.userGroups.deleteSuccess" },
    userGroupDeleteFailure: { id: "userManagement.userGroups.deleteFailure" },
    userGroupsDeleteSuccess: { id: "userManagement.multipleUserGroups.deleteSuccess" },
    userGroupsDeleteFailure: { id: "userManagement.multipleUserGroups.deleteFailure" },
    userGroupCreatedSuccess: { id: "userManagement.createUserGroup.createSuccess" },
    userGroupCreatedFailure: { id: "userManagement.createUserGroup.createFailure" },
    userDeleteSuccess: { id: "userManagement.users.deleteSuccess" },
    userDeletedFailure: { id: "userManagement.users.deleteFailure" },
    usersDeleteSuccess: { id: "userManagement.multipleUsers.deleteSuccess" },
    usersDeletedFailure: { id: "userManagement.multipleUsers.deleteFailure" },
    workspaceAddedSuccess: { id: "userManagement.workspace.addSuccess" },
    workspaceAddedError: { id: "userManagement.workspace.addError" },
    workspacesAddedToUsersSuccess: { id: "userManagement.users.multipleWorkspaces.addSuccess" },
    workspacesAddedToUsersError: { id: "userManagement.users.multipleWorkspaces.addError" },
    workspacesAddedToUserGroupsSuccess: { id: "userManagement.userGroups.multipleWorkspaces.addSuccess" },
    workspacesAddedToUserGroupsError: { id: "userManagement.userGroups.multipleWorkspaces.addError" },
    workspaceRemovedSuccess: { id: "userManagement.workspace.removeSuccess" },
    workspaceRemovedFailure: { id: "userManagement.workspace.removeError" },
    workspaceChangeSuccess: { id: "userManagement.workspace.changeSuccess" },
    workspaceChangeFailure: { id: "userManagement.workspace.changeError" },
    userGroupAddedSuccess: { id: "userManagement.userGroup.addSuccess" },
    userGroupAddedFailure: { id: "userManagement.userGroup.addError" },
    userGroupsAddedSuccess: { id: "userManagement.multipleUserGroup.addSuccess" },
    userGroupsAddedFailure: { id: "userManagement.multipleUserGroup.addError" },
    userGroupRemovedSuccess: { id: "userManagement.userGroup.removeSuccess" },
    userGroupRemoveFailure: { id: "userManagement.userGroup.removeError" },
    usersAddedSuccess: { id: "userManagement.users.addSuccess" },
    usersAddedFailure: { id: "userManagement.users.addFailure" },
    usersAddedToUserGroupsSuccess: { id: "userManagement.users.addToUserGroupsSuccess" },
    usersAddedToUserGroupsFailure: { id: "userManagement.users.addToUserGroupsFailure" },
    usersRemovedSuccess: { id: "userManagement.users.removeSuccess" },
    usersRemovedFailure: { id: "userManagement.users.removeFailure" },
    userDetailsUpdatedSuccess: { id: "userManagement.userDetails.updatedSuccess" },
    userDetailsUpdatedFailure: { id: "userManagement.userDetails.updatedFailure" },
    userGroupDetailsUpdatedSuccess: { id: "userManagement.groupDetails.updatedSuccess" },
    userGroupDetailsUpdatedFailure: { id: "userManagement.groupDetails.updatedFailure" },
    addWorkspaceButton: { id: "userManagement.buttons.addWorkspace" },
    addUserGroupButton: { id: "userManagement.buttons.addToGroup" },
    addUserButton: { id: "userManagement.buttons.addUser" },
    editUserButton: { id: "userManagement.buttons.edit" },
    editUserGroupButton: { id: "userManagement.buttons.edit" },
    deleteUserLink: { id: "userManagement.users.deleteLink" },
    deleteUserGroupLink: { id: "userManagement.userGroups.deleteLink" },
    deleteUserConfirmTitle: { id: "userManagement.deleteDialog.user.title" },
    deleteUserConfirmBody: { id: "userManagement.deleteDialog.user.body" },
    deleteUserDisabledTooltip: { id: "userManagement.deleteDialog.user.disabledTooltip" },
    deleteUsersConfirmTitle: { id: "userManagement.deleteDialog.multipleUsers.title" },
    deleteUsersConfirmBody: { id: "userManagement.deleteDialog.multipleUsers.body" },
    deleteUserGroupConfirmTitle: { id: "userManagement.deleteDialog.group.title" },
    deleteAdminUserGroupTooltip: { id: "userManagement.deleteDialog.userGroup.adminDisabledTooltip" },
    deleteNonEmptyUserGroupTooltip: { id: "userManagement.deleteDialog.userGroup.nonEmptyDisabledTooltip" },
    deleteUserGroupConfirmBody: { id: "userManagement.deleteDialog.group.body" },
    deleteUserGroupsConfirmTitle: { id: "userManagement.deleteDialog.multipleGroups.title" },
    deleteUserGroupsConfirmBody: { id: "userManagement.deleteDialog.multipleGroups.body" },
    closeDialog: { id: "userManagement.buttons.close" },
    confirmDeleteButton: { id: "userManagement.deleteDialog.confirmButton" },
    cancelDeleteButton: { id: "userManagement.deleteDialog.cancelButton" },
    emptyDetailValue: { id: "userManagement.userDetail.emptyValue" },
    closeEditMode: { id: "userManagement.userDetail.cancelButton" },
    saveEditedDetails: { id: "userManagement.userDetail.saveButton" },
    userIsAdmin: { id: "userManagement.detail.orgPermission.admin" },
    userIsAdminTooltip: { id: "userManagement.detail.orgPermission.admin.tooltip" },
    userIsRegularUser: { id: "userManagement.detail.orgPermission.member" },
    userIsRegularUserTooltip: { id: "userManagement.detail.orgPermission.member.tooltip" },
    userFirstName: { id: "userManagement.userDetail.firstName.label" },
    userLastName: { id: "userManagement.userDetail.lastName.label" },
    userEmail: { id: "userManagement.userDetail.email.label" },
    userId: { id: "userManagement.userDetail.id.label" },
    userGroupName: { id: "userManagement.groupDetail.name.label" },
    userGroupId: { id: "userManagement.groupDetail.id.label" },
    userMembership: { id: "userManagement.userDetail.orgPermission.label" },
    addUserGroupDialogTitle: { id: "userManagement.userGroups.title" },
    addUserGroupDialogCloseButton: { id: "userManagement.userGroups.cancelButton" },
    addUserGroupDialogSaveButton: { id: "userManagement.userGroups.addButton" },
    searchUserGroupNoMatch: { id: "userManagement.userGroups.noMatchingItems" },
    searchUserGroupPlaceholder: { id: "userManagement.userGroups.searchPlaceholder" },
    searchUserGroupError: { id: "userManagement.userGroups.searchError" },
    addUserDialogTitle: { id: "userManagement.users.title" },
    addUserDialogCloseButton: { id: "userManagement.users.cancelButton" },
    addUserDialogSaveButton: { id: "userManagement.users.addButton" },
    searchUserNoMatch: { id: "userManagement.users.noMatchingItems" },
    searchUserPlaceholder: { id: "userManagement.users.searchPlaceholder" },
    searchUserError: { id: "userManagement.users.searchError" },
    addWorkspaceDialogTitle: { id: "userManagement.workspace.title" },
    addWorkspaceDialogCloseButton: { id: "userManagement.users.cancelButton" },
    addWorkspaceDialogSaveButton: { id: "userManagement.workspace.addButton" },
    searchWorkspaceNoMatch: { id: "userManagement.workspace.noMatchingItems" },
    searchWorkspacePlaceholder: { id: "userManagement.workspace.searchPlaceholder" },
    searchWorkspaceError: { id: "userManagement.workspace.searchError" },
    viewWorkspaceListEmpty: { id: "userManagement.workspace.emptySelection.view" },
    editWorkspaceListEmpty: { id: "userManagement.workspace.emptySelection.edit" },
    viewUserListEmpty: { id: "userManagement.users.emptySelection.view" },
    editUserListEmpty: { id: "userManagement.users.emptySelection.edit" },
    viewUserGroupListEmpty: { id: "userManagement.userGroups.emptySelection.view" },
    editUserGroupListEmpty: { id: "userManagement.userGroups.emptySelection.edit" },
    removeSavedUserTooltip: { id: "userManagement.users.removeUserFromGroup" },
    removeUnsavedUserTooltip: { id: "userManagement.users.removeUserFromSelection" },
    removeSavedUserGroupTooltip: { id: "userManagement.userGroups.removeTooltip" },
    removeUnsavedUserGroupTooltip: { id: "userManagement.userGroups.removeUserGroupFromSelection" },
    adminAlert: { id: "userManagement.admin.alert" },
    adminPill: { id: "userManagement.admin.pill" },
});

export const userManagementHierarchicalPermissionMessages = defineMessages({
    enabled: { id: "userManagement.workspace.hierarchicalPermission.yes" },
    disabled: { id: "userManagement.workspace.hierarchicalPermission.no" },
});

export const userManagementHierarchicalPermissionTooltipMessages = defineMessages({
    enabled: { id: "userManagement.workspace.hierarchicalPermission.yes.tooltip" },
    disabled: { id: "userManagement.workspace.hierarchicalPermission.no.tooltip" },
});
