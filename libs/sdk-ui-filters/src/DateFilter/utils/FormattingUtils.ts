// (C) 2019-2020 GoodData Corporation
import moment from "moment";
import { translationUtils } from "@gooddata/util";

export const getLocalizedDateFormat = (locale: string): any => {
    const localizedMoment = moment().locale(translationUtils.sanitizeLocaleForMoment(locale));
    const localeData = localizedMoment && localizedMoment.localeData && (localizedMoment.localeData() as any);
    return localeData && localeData._longDateFormat && localeData._longDateFormat.L;
};
