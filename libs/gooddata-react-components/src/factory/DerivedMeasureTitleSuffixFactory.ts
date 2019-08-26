// (C) 2007-2018 GoodData Corporation
import { Localization } from "@gooddata/typings";
import IntlStore from "../helpers/IntlStore";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "..";

/**
 * Factory that builds formatted localized suffix string for derived measure based on the over time comparison type.
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
     * Returns formatted localized suffix string for derived measure based on the over time comparison type.
     * In case when unsupported over time comparison type is provided the empty string is returned.
     *
     * @param {OverTimeComparisonType} overTimeComparisonType - The over time comparison type for which the
     *      suffix must be obtained.
     * @returns {string}
     */
    public getSuffix(overTimeComparisonType: OverTimeComparisonType): string {
        const localizationKey = this.getSuffixLocalizationKey(overTimeComparisonType);
        return localizationKey === null ? "" : ` - ${this.translateKey(localizationKey)}`;
    }

    private getSuffixLocalizationKey(overTimeComparisonType: OverTimeComparisonType): string {
        switch (overTimeComparisonType) {
            case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
                return "measure.title.suffix.same_period_year_ago";
            case OverTimeComparisonTypes.PREVIOUS_PERIOD:
                return "measure.title.suffix.previous_period";
            default:
                return null;
        }
    }

    private translateKey(localizationKey: string): string {
        return IntlStore.getTranslation(localizationKey, this.locale);
    }
}
