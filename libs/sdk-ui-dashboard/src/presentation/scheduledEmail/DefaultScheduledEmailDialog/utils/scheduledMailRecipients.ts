// (C) 2019-2023 GoodData Corporation
import { userFullName } from "@gooddata/sdk-model";
import {
    IScheduleEmailExternalRecipient,
    IScheduleEmailRecipient,
    isScheduleEmailExistingRecipient,
} from "../interfaces.js";
import isEmpty from "lodash/isEmpty.js";
import flatMap from "lodash/flatMap.js";

export const getScheduledEmailRecipientUniqueIdentifier = (recipient: IScheduleEmailRecipient): string =>
    isScheduleEmailExistingRecipient(recipient) ? recipient.user.login : recipient.email;

export const getScheduledEmailRecipientEmail = (recipient: IScheduleEmailRecipient): string =>
    isScheduleEmailExistingRecipient(recipient) ? recipient.user.email! : recipient.email;

export const getScheduledEmailRecipientDisplayName = (recipient: IScheduleEmailRecipient): string =>
    isScheduleEmailExistingRecipient(recipient) ? userFullName(recipient.user)! : recipient.email;

const scheduleEmailRecipientDelimiter = /[,;\s]/;

export const splitScheduledEmailRecipients = (
    recipients: IScheduleEmailRecipient[],
): IScheduleEmailRecipient[] => {
    return flatMap(recipients, (recipient) => {
        return splitScheduledEmailRecipientByDelimiter(recipient, scheduleEmailRecipientDelimiter);
    });
};

export const uniqueScheduledEmailRecipients = (
    recipients: IScheduleEmailRecipient[],
): IScheduleEmailRecipient[] => {
    const recipientIds: string[] = [];
    return recipients.filter((recipient) => {
        const recipientId = getScheduledEmailRecipientUniqueIdentifier(recipient);
        if (recipientIds.includes(recipientId)) {
            return false;
        } else {
            recipientIds.push(recipientId);
            return true;
        }
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
