// (C) 2023 GoodData Corporation
import React from "react";

import CalculationListItemInfoSection from "./CalculationListItemInfoSection.js";
import { CalculationType } from "@gooddata/sdk-ui-charts";

interface ICalculationItemInfoProps {
    title: string;
    calculationType: CalculationType;
}

const CalculationListItemInfo: React.FC<ICalculationItemInfoProps> = ({ title, calculationType }) => {
    return (
        <div className="calculation-item-info">
            <h3 className="calculation-item-info-header">{title}</h3>
            <CalculationListItemInfoSection calculationType={calculationType} section="useIn" />
            <CalculationListItemInfoSection calculationType={calculationType} section="formula" />
            <CalculationListItemInfoSection calculationType={calculationType} section="example" />
        </div>
    );
};

export default CalculationListItemInfo;
