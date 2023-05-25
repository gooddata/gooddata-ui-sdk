// (C) 2019-2022 GoodData Corporation
import moment from "moment";
import isString from "lodash/isString.js";
import isDate from "lodash/isDate.js";
import { platformDateFormat, platformDateTimeFormat } from "../constants/Platform.js";

export const convertDateToPlatformDateString = (
    date: Date | undefined | null,
    dateFormat = platformDateFormat,
): string | undefined | null => (isDate(date) ? moment(date).local().format(dateFormat) : date);

export const convertPlatformDateStringToDate = (
    platformDate: string | Date | undefined | null,
): Date | undefined | null => {
    if (!isString(platformDate)) {
        return platformDate;
    }

    /**
     * Create date object with correct day from string
     * Example: "2019-11-28" with local time zone is GTM-0600
     *   local time is "2019-11-27T18:00:00 GTM-0600"
     *   after converting the local time will be "2019-11-28T00:00:00 GTM-0600"
     *
     * Example: "2019-11-28" with local time zone is GTM+0600
     *   local time is "2019-11-28T06:00:00 GTM+0600"
     *   after converting the local time will be "2019-11-28T00:00:00 GTM+0600"
     */

    // unfortunately moment does not correctly export date via toDate method (always uses system time)
    // therefore it needs to be created via standard Date object to satisfy unit tests
    return new Date(moment(platformDate, platformDateTimeFormat).format());
};
