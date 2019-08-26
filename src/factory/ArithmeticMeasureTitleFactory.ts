// (C) 2007-2018 GoodData Corporation
import { Localization } from "@gooddata/typings";
import IntlStore from "../helpers/IntlStore";
import { IMeasureTitleProps, IArithmeticMeasureTitleProps } from "..";

/**
 * Factory that builds formatted localized titles of arithmetic measures.
 * The title is used during AFM execution and for bucket item titles.
 *
 * @internal
 */
export default class ArithmeticMeasureTitleFactory {
    private readonly locale: Localization.ILocale;

    /**
     * Create a new instance of the class.
     * @param {Localization.ILocale} locale - The locale used for translation.
     */
    constructor(locale: Localization.ILocale) {
        this.locale = locale;
    }

    /**
     * Returns formatted localized title string for arithmetic measure.
     *
     * @param {IArithmeticMeasureTitleProps} arithmeticMeasureProps - The properties of arithmetic measure for which
     *      the title must be obtained.
     * @param {IMeasureTitleProps} measureTitleProps - The array of objects in which the title of master measures used
     *      in arithmetic measure is looked up.
     * @returns {string} localized title of the arithmetic measure or null when arithmetic measure references invalid
     *      master measures or invalid number of master measures.
     */
    public getTitle(
        arithmeticMeasureProps: IArithmeticMeasureTitleProps,
        measureTitleProps: IMeasureTitleProps[],
    ): string {
        const { operator, masterMeasureLocalIdentifiers } = arithmeticMeasureProps;
        const localizationKey = this.getTitleLocalizationKey(operator);
        const masterMeasureTitles = this.getMasterMeasureTitles(
            masterMeasureLocalIdentifiers,
            measureTitleProps,
        );

        return masterMeasureTitles === null ? null : this.translateKey(localizationKey, masterMeasureTitles);
    }

    private getTitleLocalizationKey(arithmeticMeasureOperator: string): string {
        switch (arithmeticMeasureOperator) {
            case "sum":
                return "visualizations.measure.arithmetic.sum.title";
            case "difference":
                return "visualizations.measure.arithmetic.difference.title";
            case "multiplication":
                return "visualizations.measure.arithmetic.multiplication.title";
            case "ratio":
                return "visualizations.measure.arithmetic.ratio.title";
            case "change":
                return "visualizations.measure.arithmetic.change.title";
            default:
                throw Error(
                    `The arithmetic measure operator '${arithmeticMeasureOperator}' is not supported!`,
                );
        }
    }

    private getMasterMeasureTitles(
        masterMeasureLocalIdentifiers: string[],
        measureTitles: IMeasureTitleProps[],
    ) {
        if (masterMeasureLocalIdentifiers.length < 2) {
            return null;
        }

        const firstMeasureTitle = this.findMeasureTitle(masterMeasureLocalIdentifiers[0], measureTitles);
        const secondMeasureTitle = this.findMeasureTitle(masterMeasureLocalIdentifiers[1], measureTitles);

        if (firstMeasureTitle === undefined || secondMeasureTitle === undefined) {
            return null;
        }

        return {
            firstMeasureTitle,
            secondMeasureTitle,
        };
    }

    private findMeasureTitle(localIdentifier: string, measureTitles: IMeasureTitleProps[]): string {
        const measureCurrentNames = measureTitles
            .filter(measureTitle => measureTitle.localIdentifier === localIdentifier)
            .map(measureTitle => measureTitle.alias || measureTitle.title);

        return measureCurrentNames.length > 0 ? measureCurrentNames[0] : undefined;
    }

    private translateKey(localizationKey: string, values: any): string {
        return IntlStore.getTranslation(localizationKey, this.locale, values);
    }
}
