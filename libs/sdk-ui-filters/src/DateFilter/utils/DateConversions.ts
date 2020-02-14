// (C) 2019 GoodData Corporation
import * as moment from "moment";
import isString = require("lodash/isString");
import isDate = require("lodash/isDate");
import { platformDateFormat } from "../constants/Platform";

const NUM_OF_MILISECONDS_IN_MINUTE = 60000;
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
    const localTimeOffsetValue = getTimeOffsetInMilliseconds();
    const localTimeValue = new Date(platformDate).getTime() + localTimeOffsetValue;

    return new Date(localTimeValue);
};

export const getTimeOffsetInMilliseconds = (): number =>
    new Date().getTimezoneOffset() * NUM_OF_MILISECONDS_IN_MINUTE;
