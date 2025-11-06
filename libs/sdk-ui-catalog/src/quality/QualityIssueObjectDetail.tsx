// (C) 2025 GoodData Corporation

import type { ISemanticQualityIssueObject } from "@gooddata/sdk-model";

type Props = {
    object: ISemanticQualityIssueObject;
};

export function QualityIssueObjectDetail({ object }: Props) {
    return (
        <div className="gd-analytics-catalog__quality-issue__object-detail">
            <div className="gd-analytics-catalog__quality-issue__object-detail__title">{object.title}</div>
            <dl>
                <dt>Type</dt>
                <dd>{object.type}</dd>
            </dl>
            <dl>
                <dt>ID</dt>
                <dd>{object.identifier}</dd>
            </dl>
        </div>
    );
}
