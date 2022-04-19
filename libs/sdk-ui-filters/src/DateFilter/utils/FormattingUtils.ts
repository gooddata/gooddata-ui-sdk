// (C) 2019-2022 GoodData Corporation
import moment from "moment";
import { translationUtils } from "@gooddata/util";

export const getLocalizedDateFormat = (locale: string): any => {
    const localizedMoment = moment().locale(translationUtils.sanitizeLocaleForMoment(locale));
    const localeData = localizedMoment?.localeData && (localizedMoment.localeData() as any);
    return localeData?._longDateFormat?.L;
};
