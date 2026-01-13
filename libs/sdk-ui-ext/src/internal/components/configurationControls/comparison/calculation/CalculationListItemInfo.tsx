// (C) 2023-2025 GoodData Corporation

import { CalculateAs, type CalculationType } from "@gooddata/sdk-ui-charts";

import { CalculationListItemInfoSection } from "./CalculationListItemInfoSection.js";

interface ICalculationItemInfoProps {
    title: string | undefined;
    calculationType: CalculationType;
}

export function CalculationListItemInfo({ title, calculationType }: ICalculationItemInfoProps) {
    return (
        <div className="calculation-item-info">
            <h3 className="calculation-item-info-header">{title}</h3>
            <CalculationListItemInfoSection
                calculationType={calculationType}
                section="useIn"
                contentClassNames="calculation-item-info-use-in-content"
                shouldHideTitle
            />
            {calculationType === CalculateAs.CHANGE_DIFFERENCE ? (
                <>
                    <CalculationListItemInfoSection
                        calculationType={CalculateAs.CHANGE}
                        section="formula"
                        isSectionCombineCalculationType
                    />
                    <CalculationListItemInfoSection
                        calculationType={CalculateAs.DIFFERENCE}
                        section="formula"
                        isSectionCombineCalculationType
                    />
                </>
            ) : (
                <CalculationListItemInfoSection calculationType={calculationType} section="formula" />
            )}
            <CalculationListItemInfoSection calculationType={calculationType} section="example" />
        </div>
    );
}
