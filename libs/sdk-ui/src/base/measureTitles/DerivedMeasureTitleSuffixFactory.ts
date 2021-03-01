// (C) 2007-2021 GoodData Corporation
import { getTranslation } from "../localization/IntlStore";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "../interfaces/OverTimeComparison";
import { ILocale } from "../localization/Locale";

/**
 * Factory that builds formatted localized suffix string for derived measure based on the over time comparison type.
 * The suffix is used during AFM execution and for bucket item titles.
 *
 * @internal
 */
export class DerivedMeasureTitleSuffixFactory {
    private readonly locale: ILocale;

    /**
     * Create a new instance of the class.
     * @param locale - The locale used for translation.
     */
    constructor(locale: ILocale) {
        this.locale = locale;
    }

    /**
     * Returns formatted localized suffix string for derived measure based on the over time comparison type.
     * In case when unsupported over time comparison type is provided the empty string is returned.
     *
     * @param overTimeComparisonType - The over time comparison type for which the
     *      suffix must be obtained.
     * @returns localized suffix
     */
    public getSuffix(overTimeComparisonType: OverTimeComparisonType): string {
        const localizationKey = this.getSuffixLocalizationKey(overTimeComparisonType);
        return localizationKey === null ? "" : ` - ${this.translateKey(localizationKey)}`;
    }

    private getSuffixLocalizationKey(overTimeComparisonType: OverTimeComparisonType): string | null {
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
        return getTranslation(localizationKey, this.locale);
    }
}
