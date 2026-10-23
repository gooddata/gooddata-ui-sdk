// (C) 2021-2026 GoodData Corporation

export enum EventCategories {
    emptyMetricList = "emptyMetricList",
    metricList = "metricList",
    metricComponent = "metricComponent",
}

export enum Events {
    pageView = "pageView",

    // these two events have a different name format for compatibility with other UI apps (AD, KD, ...)
    // so we can parse them and group across applications in the tracker BI project
    performanceFirstContentfulPaint = "first-contentful-paint-in-ms",
    performanceLargestContentfulPaint = "largest-contentful-paint-in-ms",

    metricCreateClick = "metricCreateClick",
    metricEditClick = "metricEditClick",
    metricCopyClick = "metricCopyClick",
    metricDeleteClick = "metricDeleteClick",

    howToCreateClick = "howToCreateClick",

    metricClick = "metricClick",
    metricNameClick = "metricNameClick",
    metricIdClick = "metricIdClick",

    sortChanged = "sortChanged",
    searchUsed = "searchUsed",
    metricTooltipDisplayed = "metricTooltipDisplayed",
    metricOpenFromTooltip = "metricOpenFromTooltip",

    metricCopied = "metricCopied",
    metricCopyFailed = "metricCopyFailed",
    metricDeleted = "metricDeleted",
    metricDeleteFailed = "metricDeleteFailed",

    /***** metric component *****/

    metricNameCreated = "metricNameCreated",
    metricIdCreated = "metricIdCreated",
    metricIdEdit = "metricIdEdit",
    metricDefinitionCreated = "metricDefinitionCreated",
    metricDescriptionAdded = "metricDescriptionAdded",
    metricUsageClick = "metricUsageClick",
    metricSaveFailed = "metricSaveFailed",
    metricSavedAndClosed = "metricSavedAndClosed",
    metricEditedAndClosed = "metricEditedAndClosed",
    metricClosedWithoutSave = "metricClosedWithoutSave",
    metricFormatChanged = "metricFormatChanged",
    metricSavedAsNew = "metricSavedAsNew",
    metricSaveAsNewFailed = "metricSaveAsNewFailed",

    metricConflictedId = "metricConflictedId",

    editorToggleSuggestionDetails = "editorToggleSuggestionDetails",
    editorSuggestionDetailLinkClick = "editorSuggestionDetailLinkClick",

    /***** data stats *****/

    workspaceMetricStatsChanged = "workspaceMetricStatsChanged",

    /******* Conversion Dialog ********/

    upgradeButtonClicked = "upgradeButtonClicked",
    inviteButtonClicked = "inviteButtonClicked",
    conversionDialogOpened = "conversionDialogOpened",
    contactSales = "contactSales",
    inviteUser = "inviteUser",
}
