// (C) 2023 GoodData Corporation

import { splitScheduledEmailRecipients, uniqueScheduledEmailRecipients } from "../scheduledMailRecipients.js";
import { describe, it, expect } from "vitest";

const scheduleEmailExistingRecipient = {
    user: {
        email: "test@gooddata.com",
        firstName: "First name",
        fullName: "Full name",
        lastName: "Last name",
        login: "test@gooddata.com",
        ref: {
            uri: "/gdc/account/profile/123456",
        },
    },
};

const scheduleEmailExternalRecipientSameExisting = {
    email: "test@gooddata.com",
};

const scheduleEmailExternalRecipient = {
    email: "external@gooddata.com",
};

const scheduleEmailExternalRecipientWithUnsupportedDelimiter = {
    email: "external@gooddata.com|new_external@gooddata.com",
};

const scheduleEmailExternalRecipientWithCommaDelimiter = {
    email: "external@gooddata.com,external1@gooddata.com",
};

const scheduleEmailExternalRecipientWithSemicolonDelimiter = {
    email: "external@gooddata.com; external1@gooddata.com",
};

const scheduleEmailExternalRecipientWithSpaceDelimiter = {
    email: "external@gooddata.com external1@gooddata.com",
};

const scheduleEmailExternalRecipientWithMultipleDelimiter = {
    email: "external@gooddata.com,external1@gooddata.com;  external2@gooddata.com",
};

describe("schedule email recipients utils", () => {
    describe("split schedule email recipients", () => {
        it("with unsupported delimiter", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipientWithUnsupportedDelimiter,
            ];
            const result = splitScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });

        it("with comma delimiter", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipientWithCommaDelimiter,
            ];
            const result = splitScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });

        it("with semicolon delimiter", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipientWithSemicolonDelimiter,
            ];
            const result = splitScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });

        it("with space delimiter", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipientWithSpaceDelimiter,
            ];
            const result = splitScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });

        it("with multiple delimiter", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipientWithMultipleDelimiter,
            ];
            const result = splitScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });
    });

    describe("unique schedule email recipients", () => {
        it("without duplicate", () => {
            const recipients = [scheduleEmailExistingRecipient, scheduleEmailExternalRecipient];
            const result = uniqueScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });

        it("with existing email duplicate", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipient,
            ];
            const result = uniqueScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });

        it("with external email duplicate", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipient,
                scheduleEmailExternalRecipient,
            ];
            const result = uniqueScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });

        it("with external and existing email are duplicate", () => {
            const recipients = [
                scheduleEmailExistingRecipient,
                scheduleEmailExternalRecipient,
                scheduleEmailExternalRecipientSameExisting,
            ];
            const result = uniqueScheduledEmailRecipients(recipients);
            expect(result).toMatchSnapshot();
        });
    });
});
