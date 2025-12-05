// (C) 2007-2025 GoodData Corporation
import { MessageDescriptor } from "react-intl";

import { messages } from "../../locales.js";
import { OverTimeComparisonType, OverTimeComparisonTypes } from "../interfaces/OverTimeComparison.js";
import { getTranslation } from "../localization/IntlStore.js";
import { ILocale } from "../localization/Locale.js";

/**
 * Factory that builds formatted localized suffix string for derived measure based on the over time comparison type.
 * The suffix is used during AFM execution and for bucket item titles.
 *
 * @internal
 */
export class DerivedMeasureTitleSuffixFactory {
    private readonly locale: ILocale;
    private readonly messages: Record<string, string>;

    /**
     * Create a new instance of the class.
     * @param locale - The locale used for translation.
     */
    constructor(locale: ILocale, messages: Record<string, string>) {
        this.locale = locale;
        this.messages = messages;
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

    private getSuffixLocalizationKey(
        overTimeComparisonType: OverTimeComparisonType,
    ): MessageDescriptor | null {
        switch (overTimeComparisonType) {
            case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
                return messages["samePeriodYearAgo"];
            case OverTimeComparisonTypes.PREVIOUS_PERIOD:
                return messages["previousPeriod"];
            default:
                return null;
        }
    }

    private translateKey(localizationKey: MessageDescriptor): string {
        return getTranslation(localizationKey, this.locale, this.messages);
    }
}
