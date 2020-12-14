// (C) 2019-2020 GoodData Corporation
import { IScheduleEmailRecipient, isScheduleEmailExistingRecipient } from "../interfaces";

export const getScheduledEmailRecipientUniqueIdentifier = (recipient: IScheduleEmailRecipient) =>
    isScheduleEmailExistingRecipient(recipient) ? recipient.user.login : recipient.email;

export const getScheduledEmailRecipientEmail = (recipient: IScheduleEmailRecipient) =>
    isScheduleEmailExistingRecipient(recipient) ? recipient.user.email : recipient.email;

export const getScheduledEmailRecipientDisplayName = (recipient: IScheduleEmailRecipient) =>
    isScheduleEmailExistingRecipient(recipient)
        ? `${recipient.user.firstName} ${recipient.user.lastName}`
        : recipient.email;
