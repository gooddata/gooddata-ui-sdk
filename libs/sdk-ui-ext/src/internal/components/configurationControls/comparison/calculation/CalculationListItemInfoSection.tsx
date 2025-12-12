// (C) 2023-2025 GoodData Corporation

import { startCase } from "lodash-es";
import { FormattedMessage } from "react-intl";

import { type CalculationType } from "@gooddata/sdk-ui-charts";

import { comparisonMessages } from "../../../../../locales.js";

type SectionType = "example" | "useIn" | "formula";

interface ICalculationItemInfoSectionProps {
    calculationType: CalculationType;
    section: SectionType;
    contentClassNames?: string;
    shouldHideTitle?: boolean;
    isSectionCombineCalculationType?: boolean;
}

const SECTION_TITLE_KEYS: Record<string, string> = {
    example: comparisonMessages["calculationTooltipExampleSection"].id,
    formula: comparisonMessages["calculationTooltipFormulaSection"].id,
    formulaChange: comparisonMessages["calculationTooltipFormulaChangeSection"].id,
    formulaDifference: comparisonMessages["calculationTooltipFormulaDifferenceSection"].id,
};

const SECTION_CONTENT_KEYS: Record<string, string> = {
    exampleChange: comparisonMessages["calculatedAsChangeTooltipExample"].id,
    useInChange: comparisonMessages["calculatedAsChangeTooltipUseIn"].id,
    formulaChange: comparisonMessages["calculatedAsChangeTooltipFormula"].id,
    exampleRatio: comparisonMessages["calculatedAsRatioTooltipExample"].id,
    useInRatio: comparisonMessages["calculatedAsRatioTooltipUseIn"].id,
    formulaRatio: comparisonMessages["calculatedAsRatioTooltipFormula"].id,
    exampleDifference: comparisonMessages["calculatedAsDifferenceTooltipExample"].id,
    useInDifference: comparisonMessages["calculatedAsDifferenceTooltipUseIn"].id,
    formulaDifference: comparisonMessages["calculatedAsDifferenceTooltipFormula"].id,
    exampleChangeDifference: comparisonMessages["calculatedAsChangeDifferenceTooltipExample"].id,
    useInChangeDifference: comparisonMessages["calculatedAsChangeDifferenceTooltipUseIn"].id,
};

const toPascalCase = (value: string): string => {
    return startCase(value).replace(/\s/g, "");
};

const getSectionTitleKey = (
    section: SectionType,
    calculationType: CalculationType,
    isSectionCombineCalculationType: boolean,
): string => {
    const property = isSectionCombineCalculationType ? `${section}${toPascalCase(calculationType)}` : section;

    return SECTION_TITLE_KEYS[property];
};

const getSectionContentKey = (section: SectionType, calculationType: CalculationType): string => {
    const property = `${section}${toPascalCase(calculationType)}`;
    return SECTION_CONTENT_KEYS[property];
};

export function CalculationListItemInfoSection({
    calculationType,
    section,
    contentClassNames,
    shouldHideTitle,
    isSectionCombineCalculationType,
}: ICalculationItemInfoSectionProps) {
    const titleKey = getSectionTitleKey(section, calculationType, isSectionCombineCalculationType);
    const contentKey = getSectionContentKey(section, calculationType);

    return (
        <>
            {shouldHideTitle ? null : <FormattedMessage id={titleKey} tagName="h4" />}
            <p className={contentClassNames}>
                <FormattedMessage id={contentKey} />
            </p>
        </>
    );
}
