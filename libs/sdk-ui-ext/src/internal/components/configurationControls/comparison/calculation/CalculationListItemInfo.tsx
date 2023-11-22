// (C) 2023 GoodData Corporation
import React from "react";

import CalculationListItemInfoSection from "./CalculationListItemInfoSection.js";
import { CalculateAs, CalculationType } from "@gooddata/sdk-ui-charts";

interface ICalculationItemInfoProps {
    title: string;
    calculationType: CalculationType;
}

const CalculationListItemInfo: React.FC<ICalculationItemInfoProps> = ({ title, calculationType }) => {
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
};

export default CalculationListItemInfo;
