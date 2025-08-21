// (C) 2023-2025 GoodData Corporation
import React from "react";

import { CalculateAs, CalculationType } from "@gooddata/sdk-ui-charts";

import CalculationListItemInfoSection from "./CalculationListItemInfoSection.js";

interface ICalculationItemInfoProps {
    title: string;
    calculationType: CalculationType;
}

function CalculationListItemInfo({ title, calculationType }: ICalculationItemInfoProps) {
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

export default CalculationListItemInfo;
