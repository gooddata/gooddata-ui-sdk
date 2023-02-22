// (C) 2022-2023 GoodData Corporation
import { defineMessages } from "react-intl";

//NOTE: Follow-up ticket for move all messages: https://gooddata.atlassian.net/browse/FET-1050

export const dialogHeadlineLabels = defineMessages({
    definition: { id: "embedInsightDialog.headLine.byDefinition" },
    reference: { id: "embedInsightDialog.headLine.byReference" },
});

export const dialogChangeMessageLabels = defineMessages({
    definition: { id: "embedInsightDialog.headLine.byDefinition.tooltip" },
    reference: { id: "embedInsightDialog.headLine.byReference.tooltip" },
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
