// (C) 2022 GoodData Corporation
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
    edit: { id: "shareDialog.share.granular.grantee.permission.edit" },
    view: { id: "shareDialog.share.granular.grantee.permission.view" },
    share: { id: "shareDialog.share.granular.grantee.permission.share" },
});
