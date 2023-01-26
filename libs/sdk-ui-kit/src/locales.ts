// (C) 2022-2023 GoodData Corporation
import { defineMessages } from "react-intl";

//NOTE: Follow up ticket for move all messages: https://gooddata.atlassian.net/browse/FET-1050

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
});
