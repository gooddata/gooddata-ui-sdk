// (C) 2023 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import capitalize from "lodash/capitalize.js";

import { CalculationType } from "@gooddata/sdk-ui-charts";

import { comparisonMessages } from "../../../../../locales.js";

type SectionType = "example" | "useIn" | "formula";

interface ICalculationItemInfoSectionProps {
    calculationType: CalculationType;
    section: SectionType;
}

const SECTION_TITLE_KEYS: Record<SectionType, string> = {
    example: comparisonMessages.calculationTooltipExampleSection.id,
    useIn: comparisonMessages.calculationTooltipUseInSection.id,
    formula: comparisonMessages.calculationTooltipFormulaSection.id,
};

const SECTION_CONTENT_KEYS: Record<string, string> = {
    exampleChange: comparisonMessages.calculatedAsChangeTooltipExample.id,
    useInChange: comparisonMessages.calculatedAsChangeTooltipUseIn.id,
    formulaChange: comparisonMessages.calculatedAsChangeTooltipFormula.id,
    exampleRatio: comparisonMessages.calculatedAsRatioTooltipExample.id,
    useInRatio: comparisonMessages.calculatedAsRatioTooltipUseIn.id,
    formulaRatio: comparisonMessages.calculatedAsRatioTooltipFormula.id,
    exampleDifference: comparisonMessages.calculatedAsDifferenceTooltipExample.id,
    useInDifference: comparisonMessages.calculatedAsDifferenceTooltipUseIn.id,
    formulaDifference: comparisonMessages.calculatedAsDifferenceTooltipFormula.id,
};

const getSectionTitleKey = (section: SectionType): string => {
    return SECTION_TITLE_KEYS[section];
};

const getSectionContentKey = (section: SectionType, calculationType: CalculationType): string => {
    const property = `${section}${capitalize(calculationType)}`;
    return SECTION_CONTENT_KEYS[property];
};

const CalculationListItemInfoSection: React.FC<ICalculationItemInfoSectionProps> = ({
    calculationType,
    section,
}) => {
    const titleKey = getSectionTitleKey(section);
    const contentKey = getSectionContentKey(section, calculationType);

    return (
        <>
            <FormattedMessage id={titleKey} tagName="h4" />
            <FormattedMessage id={contentKey} tagName="p" />
        </>
    );
};

export default CalculationListItemInfoSection;
