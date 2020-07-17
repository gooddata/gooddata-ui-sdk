// (C) 2019-2020 GoodData Corporation
import moment from "moment";

export const sanitizeLocaleForMoment = (intlLocale: string): string => {
    if (intlLocale === "zh-Hans") {
        return "zh-CN";
    }
    return intlLocale;
};

export const getLocalizedDateFormat = (locale: string) => {
    const localizedMoment = moment().locale(sanitizeLocaleForMoment(locale));
    const localeData = localizedMoment && localizedMoment.localeData && (localizedMoment.localeData() as any);
    return localeData && localeData._longDateFormat && localeData._longDateFormat.L;
};
