// (C) 2019-2024 GoodData Corporation
import {
    IScheduleEmailExternalRecipient,
    IScheduleEmailRecipient,
    isScheduleEmailExistingRecipient,
} from "../interfaces.js";
import isEmpty from "lodash/isEmpty.js";
import flatMap from "lodash/flatMap.js";

const scheduleEmailRecipientDelimiter = /[,;\s]/;

export const splitScheduledEmailRecipients = (
    recipients: IScheduleEmailRecipient[],
): IScheduleEmailRecipient[] => {
    return flatMap(recipients, (recipient) => {
        return splitScheduledEmailRecipientByDelimiter(recipient, scheduleEmailRecipientDelimiter);
    });
};

const splitScheduledEmailRecipientByDelimiter = (
    recipient: IScheduleEmailRecipient,
    delimiter: RegExp,
): IScheduleEmailRecipient[] => {
    if (isScheduleEmailExistingRecipient(recipient)) {
        return [recipient];
    }
    return splitScheduledEmailExternalRecipientByDelimiter(recipient, delimiter);
};

const splitScheduledEmailExternalRecipientByDelimiter = (
    recipient: IScheduleEmailExternalRecipient,
    delimiter: RegExp,
): IScheduleEmailExternalRecipient[] => {
    return recipient.email
        .split(delimiter)
        .map((val) => val.trim())
        .filter((val) => !isEmpty(val))
        .map((email) => ({ email }));
};
