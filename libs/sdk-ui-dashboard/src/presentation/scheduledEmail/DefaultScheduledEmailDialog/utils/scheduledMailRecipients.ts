// (C) 2019-2022 GoodData Corporation
import { userFullName } from "@gooddata/sdk-model";
import { IScheduleEmailRecipient, isScheduleEmailExistingRecipient } from "../interfaces";

export const getScheduledEmailRecipientUniqueIdentifier = (recipient: IScheduleEmailRecipient): string =>
    isScheduleEmailExistingRecipient(recipient) ? recipient.user.login : recipient.email;

export const getScheduledEmailRecipientEmail = (recipient: IScheduleEmailRecipient): string =>
    isScheduleEmailExistingRecipient(recipient) ? recipient.user.email! : recipient.email;

export const getScheduledEmailRecipientDisplayName = (recipient: IScheduleEmailRecipient): string =>
    isScheduleEmailExistingRecipient(recipient) ? userFullName(recipient.user)! : recipient.email;
