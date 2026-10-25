// (C) 2007-2026 GoodData Corporation

import { useCallback, useRef } from "react";

import { useIntl } from "react-intl";

import { type ICatalogAttribute, type ObjRef, objRefToString } from "@gooddata/sdk-model";
import { Button } from "@gooddata/sdk-ui-kit";

import { Recommendation } from "./Recommendation.js";

interface IRecommendationComparisonProps {
    availableAttributes?: ReadonlyArray<ICatalogAttribute>;
    onApply: (attributeRef: ObjRef) => void;
}

export function RecommendationComparison({
    availableAttributes = [],
    onApply,
}: IRecommendationComparisonProps) {
    const intl = useIntl();
    const selectRef = useRef<HTMLSelectElement>(undefined);

    const handleApply = useCallback(() => {
        onApply(
            availableAttributes.find(
                (attribute: ICatalogAttribute) =>
                    objRefToString(attribute.attribute.ref) === selectRef.current.value,
            ).attribute.ref,
        );
    }, [availableAttributes, onApply]);

    const renderSelect = () => {
        return (
            <select ref={selectRef} className="adi-attribute-switch s-attribute-switch">
                {availableAttributes.map((attribute: ICatalogAttribute) => {
                    const attributeRefString = objRefToString(attribute.attribute.ref);
                    return (
                        <option key={attributeRefString} value={attributeRefString}>
                            {attribute.attribute.title}
                        </option>
                    );
                })}
            </select>
        );
    };

    return (
        <Recommendation type="comparison">
            <h3 className="gd-heading-3">
                {intl.formatMessage({ id: "recommendation.comparison.compare" })}
            </h3>

            {intl.formatMessage({ id: "recommendation.comparison.between_each" })}

            {renderSelect()}

            <Button
                className="gd-button-secondary s-apply-recommendation"
                value={intl.formatMessage({ id: "apply" })}
                onClick={handleApply}
            />
        </Recommendation>
    );
}
