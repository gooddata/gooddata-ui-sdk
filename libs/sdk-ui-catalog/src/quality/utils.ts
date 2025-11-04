// (C) 2025 GoodData Corporation

import {
    type ISemanticQualityIssue,
    type Identifier,
    type SemanticQualityIssueCode,
    type SemanticQualityIssueSeverity,
    SemanticQualityIssueSeverityOrder as SeverityOrder,
} from "@gooddata/sdk-model";

export function getQualityIssueCodes(issues: ISemanticQualityIssue[]): SemanticQualityIssueCode[] {
    return [...new Set(issues.map((issue) => issue.code))];
}

export function getQualityIssueIdsByCodes(
    issues: ISemanticQualityIssue[],
    codes: SemanticQualityIssueCode[],
    type: "included" | "excluded" = "included",
): Identifier[] {
    const idSet = new Set<Identifier>();
    for (const issue of issues) {
        const matches = codes.includes(issue.code);
        const shouldInclude = type === "excluded" ? !matches : matches;
        if (shouldInclude) {
            for (const obj of issue.objects) {
                idSet.add(obj.identifier);
            }
        }
    }
    return [...idSet];
}

export function getQualityIssuesHighestSeverity(
    issues: ISemanticQualityIssue[],
): SemanticQualityIssueSeverity {
    let severity: SemanticQualityIssueSeverity = "INFO";

    for (const issue of issues) {
        if (SeverityOrder[issue.severity] > SeverityOrder[severity]) {
            severity = issue.severity;
        }
    }

    return severity;
}

export function groupQualityIssuesByCode(
    issues: ISemanticQualityIssue[],
): Map<SemanticQualityIssueCode, ISemanticQualityIssue[]> {
    return groupQualityIssuesBy(issues, (issue) => issue.code);
}

export function groupQualityIssuesBySeverity(
    issues: ISemanticQualityIssue[],
): Map<SemanticQualityIssueSeverity, ISemanticQualityIssue[]> {
    return groupQualityIssuesBy(issues, (issue) => issue.severity);
}

function groupQualityIssuesBy<K>(
    items: ISemanticQualityIssue[],
    keyExtractor: (item: ISemanticQualityIssue) => K,
): Map<K, ISemanticQualityIssue[]> {
    const groupMap = new Map<K, ISemanticQualityIssue[]>();

    for (const item of items) {
        const key = keyExtractor(item);
        const existingGroup = groupMap.get(key);
        if (existingGroup) {
            existingGroup.push(item);
        } else {
            groupMap.set(key, [item]);
        }
    }

    return groupMap;
}
