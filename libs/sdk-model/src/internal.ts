// (C) 2023-2024 GoodData Corporation

export type { IDrillToUrlPlaceholder } from "./dashboard/drillUrl.js";
export {
    joinDrillUrlParts,
    splitDrillUrlParts,
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
} from "./dashboard/drillUrl.js";
