// (C) 2019-2022 GoodData Corporation
import moment from "moment";
import isString from "lodash/isString";
import isDate from "lodash/isDate";
import { platformDateFormat } from "../constants/Platform";

const NUM_OF_MILLISECONDS_IN_MINUTE = 60000;
export const convertDateToPlatformDateString = (date: Date | undefined | null): string | undefined | null =>
    isDate(date) ? moment(date).format(platformDateFormat) : date;

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
    const convertedDate = new Date(platformDate);
    const localTimeOffsetValue = getTimeOffsetInMilliseconds(convertedDate);
    const localTimeValue = convertedDate.getTime() + localTimeOffsetValue;

    return new Date(localTimeValue);
};

/**
 * Returns the timezone offset in milliseconds for the given date.
 * @param when - when to return the offset for. This is important because of DST - the offset changes during the year.
 */
const getTimeOffsetInMilliseconds = (when: Date): number =>
    when.getTimezoneOffset() * NUM_OF_MILLISECONDS_IN_MINUTE;
