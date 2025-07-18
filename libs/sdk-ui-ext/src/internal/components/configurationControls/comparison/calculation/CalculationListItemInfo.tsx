// (C) 2023-2025 GoodData Corporation

import CalculationListItemInfoSection from "./CalculationListItemInfoSection.js";
import { CalculateAs, CalculationType } from "@gooddata/sdk-ui-charts";

interface ICalculationItemInfoProps {
    title: string;
    calculationType: CalculationType;
}

export default function CalculationListItemInfo({ title, calculationType }: ICalculationItemInfoProps) {
    return (
        <div className="calculation-item-info">
            <h3 className="calculation-item-info-header">{title}</h3>
            <CalculationListItemInfoSection
                calculationType={calculationType}
                section="useIn"
                contentClassNames="calculation-item-info-use-in-content"
                shouldHideTitle={true}
            />
            {calculationType === CalculateAs.CHANGE_DIFFERENCE ? (
                <>
                    <CalculationListItemInfoSection
                        calculationType={CalculateAs.CHANGE}
                        section="formula"
                        isSectionCombineCalculationType={true}
                    />
                    <CalculationListItemInfoSection
                        calculationType={CalculateAs.DIFFERENCE}
                        section="formula"
                        isSectionCombineCalculationType={true}
                    />
                </>
            ) : (
                <CalculationListItemInfoSection calculationType={calculationType} section="formula" />
            )}
            <CalculationListItemInfoSection calculationType={calculationType} section="example" />
        </div>
    );
}
