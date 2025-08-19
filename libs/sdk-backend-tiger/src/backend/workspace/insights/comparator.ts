// (C) 2023-2025 GoodData Corporation
import { IInsight, insightCreated, insightTitle, insightUpdated } from "@gooddata/sdk-model";

const insightDate = (insight: IInsight) => insightUpdated(insight) ?? insightCreated(insight) ?? "";

const compareCaseInsensitive = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "base" });

const compareDatesDesc = (insightA: IInsight, insightB: IInsight) =>
    compareCaseInsensitive(insightDate(insightB), insightDate(insightA));

const compareTitlesAsc = (insightA: IInsight, insightB: IInsight) =>
    compareCaseInsensitive(insightTitle(insightA), insightTitle(insightB));

export const insightListComparator = (insightA: IInsight, insightB: IInsight) =>
    compareDatesDesc(insightA, insightB) || compareTitlesAsc(insightA, insightB);
