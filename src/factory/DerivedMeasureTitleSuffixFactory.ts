// (C) 2007-2018 GoodData Corporation
import { Localization, VisualizationObject } from '@gooddata/typings';
import IntlStore from '../helpers/IntlStore';
import IMeasureDefinitionType = VisualizationObject.IMeasureDefinitionType;

/**
 * Factory that builds formatted localized suffix string for derived measure based on the measure definition type.
 * The suffix is used during AFM execution and for bucket item titles.
 *
 * @internal
 */
export default class DerivedMeasureTitleSuffixFactory {

    private readonly locale: Localization.ILocale;

    /**
     * Create a new instance of the class.
     * @param {Localization.ILocale} locale - The locale used for translation.
     */
    constructor(locale: Localization.ILocale) {
        this.locale = locale;
    }

    /**
     * Returns formatted localized suffix string for derived measure based on the measure definition type.
     * In case when simple measure definition is provided the empty string is returned.
     *
     * @param {VisualizationObject.IMeasureDefinitionType} measureDefinition - The measure definition for which the
     *      suffix must be obtained.
     * @returns {string}
     */
    public getSuffix(measureDefinition: IMeasureDefinitionType): string {
        const localizationKey = this.getSuffixLocalizationKey(measureDefinition);
        return localizationKey === null ? '' : ` - ${this.translateKey(localizationKey)}`;
    }

    private getSuffixLocalizationKey(measureDefinition: IMeasureDefinitionType): string {
        if (VisualizationObject.isPopMeasureDefinition(measureDefinition)) {
            return 'measure.title.suffix.same_period_year_ago';
        } else if (VisualizationObject.isPreviousPeriodMeasureDefinition(measureDefinition)) {
            return 'measure.title.suffix.previous_period';
        } else {
            return null;
        }
    }

    private translateKey(localizationKey: string): string {
        return IntlStore.getTranslation(localizationKey, this.locale);
    }
}
