// (C) 2026 GoodData Corporation

import moment from "moment";
import { type IntlShape } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import {
    type IAutomationAlert,
    type IAutomationMetadataObject,
    type IExportDefinitionMetadataObject,
    type IOrganizationUser,
    type IUser,
    type IWorkspaceUser,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";

import { ARITHMETIC_OPERATORS, DATE_FORMAT_SLASH } from "../constants.js";
import {
    formatAlertSubtitle,
    formatAttachments,
    formatAutomationSubtitle,
    formatAutomationUser,
    formatCellValue,
    formatDate,
    formatWorkspaceUserFilterOptions,
} from "../format.js";
import { messages } from "../messages.js";

const mockIntl = {
    formatMessage: vi.fn(({ id }) => {
        const entry = Object.entries(messages).find(([_, value]) => value.id === id);
        return entry ? entry[0] : id;
    }),
} as unknown as IntlShape;

describe("automations format", () => {
    describe("formatAutomationSubtitle", () => {
        it("should return alert subtitle when automation has an alert", () => {
            const automation = {
                alert: {
                    condition: {
                        type: "comparison",
                        operator: "GREATER_THAN",
                        left: { title: "Measure", id: "m1" },
                        right: 10,
                    },
                },
            } as IAutomationMetadataObject;
            expect(formatAutomationSubtitle(automation, mockIntl)).toBe(
                "Measure comparisonoperatorgreaterthan 10",
            );
        });

        it("should return cron description when automation has a schedule", () => {
            const automation = {
                schedule: {
                    cronDescription: "Every Monday",
                },
            } as IAutomationMetadataObject;
            expect(formatAutomationSubtitle(automation, mockIntl)).toBe("Every Monday");
        });

        it("should return empty string when automation has neither alert nor schedule", () => {
            const automation = {} as IAutomationMetadataObject;
            expect(formatAutomationSubtitle(automation, mockIntl)).toBe("");
        });
    });

    describe("formatAlertSubtitle", () => {
        it("should format relative condition with change operator", () => {
            const alert = {
                condition: {
                    type: "relative",
                    operator: "INCREASES_BY",
                    measure: {
                        left: { title: "M1", id: "m1" },
                        operator: ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_CHANGE,
                    },
                    threshold: 5,
                },
            } as unknown as IAutomationAlert;
            // mockIntl returns the ID, which is then lowercased in formatAlertSubtitle
            expect(formatAlertSubtitle(mockIntl, alert)).toBe("M1 comparisonoperatorchangeincreasesby 5 %");
        });

        it("should format relative condition with difference operator", () => {
            const alert = {
                condition: {
                    type: "relative",
                    operator: "DECREASES_BY",
                    measure: {
                        left: { id: "m1" }, // no title
                        operator: ARITHMETIC_OPERATORS.ARITHMETIC_OPERATOR_DIFFERENCE,
                    },
                    threshold: 10,
                },
            } as unknown as IAutomationAlert;
            expect(formatAlertSubtitle(mockIntl, alert)).toBe(
                "m1 comparisonoperatordifferencedecreasesby 10",
            );
        });

        it("should format comparison condition", () => {
            const alert = {
                condition: {
                    type: "comparison",
                    operator: "LESS_THAN",
                    left: { title: "Measure", id: "m1" },
                    right: 20,
                },
            } as unknown as IAutomationAlert;
            expect(formatAlertSubtitle(mockIntl, alert)).toBe("Measure comparisonoperatorlessthan 20");
        });

        it("should format anomaly detection condition", () => {
            const alert = {
                condition: {
                    type: "anomalyDetection",
                    measure: { title: "Measure", id: "m1" },
                    sensitivity: "MEDIUM",
                    granularity: "DAY",
                },
            } as unknown as IAutomationAlert;
            expect(formatAlertSubtitle(mockIntl, alert)).toBe("Measure anomalyDetectionOperator");
        });

        it("should return empty string for unknown condition type", () => {
            const alert = {
                condition: {
                    type: "unknown",
                },
            } as unknown as IAutomationAlert;
            expect(formatAlertSubtitle(mockIntl, alert)).toBe("");
        });

        it("should return empty string if alert is missing", () => {
            expect(formatAlertSubtitle(mockIntl, undefined)).toBe("");
        });
    });

    describe("formatAttachments", () => {
        it("should format multiple attachments", () => {
            const attachments = [
                { requestPayload: { format: "csv" } },
                { requestPayload: { format: "pdf" } },
            ] as unknown as IExportDefinitionMetadataObject[];
            expect(formatAttachments(attachments)).toBe("csv, pdf");
        });

        it("should return empty string for empty attachments", () => {
            expect(formatAttachments([])).toBe("");
        });

        it("should return undefined/empty if attachments are missing", () => {
            expect(formatAttachments(undefined)).toBeUndefined();
        });
    });

    describe("formatAutomationUser", () => {
        it("should return full name when firstName and lastName are present", () => {
            const user = { firstName: "John", lastName: "Doe" } as IUser;
            expect(formatAutomationUser(user)).toBe("John Doe");
        });

        it("should return only firstName if lastName is missing", () => {
            const user = { firstName: "John" } as IUser;
            expect(formatAutomationUser(user)).toBe("John");
        });

        it("should return email if name is missing", () => {
            const user = { email: "john.doe@example.com" } as IUser;
            expect(formatAutomationUser(user)).toBe("john.doe@example.com");
        });

        it("should return identifier from ref if name and email are missing", () => {
            const user = { ref: idRef("user-id") } as IUser;
            expect(formatAutomationUser(user)).toBe("user-id");
        });

        it("should return empty string if no info is available", () => {
            const user = { ref: uriRef("/uri") } as IUser;
            expect(formatAutomationUser(user)).toBe("");
        });

        it("should return empty string if user is missing", () => {
            expect(formatAutomationUser(undefined)).toBe("");
        });
    });

    describe("formatDate", () => {
        const testDate = "2023-10-27T10:00:00Z";

        it("should format date with timezone", () => {
            // New York is UTC-4 in October (EDT)
            expect(formatDate(testDate, "America/New_York")).toBe("2023-10-27 06:00");
        });

        it("should format date as UTC if timezone is missing", () => {
            expect(formatDate(testDate, undefined)).toBe("2023-10-27 10:00");
        });

        it("should use custom format if provided", () => {
            expect(formatDate(testDate, undefined, DATE_FORMAT_SLASH)).toBe("10/27/2023 10:00");
        });

        it("should return empty string for empty date", () => {
            expect(formatDate("", "UTC")).toBe("");
        });
    });

    describe("formatCellValue", () => {
        it("should format date type", () => {
            const value = "2023-10-27T10:00:00Z";
            expect(formatCellValue(value, "date", "UTC")).toBe("2023-10-27 10:00");
        });

        it("should format slash-date type", () => {
            const value = "2023-10-27T10:00:00Z";
            expect(formatCellValue(value, "slash-date", "UTC")).toBe("10/27/2023 10:00");
        });

        it("should return string value for number type", () => {
            expect(formatCellValue(123, "number")).toBe("123");
        });

        it("should return string value for text type", () => {
            expect(formatCellValue("hello", "text")).toBe("hello");
        });

        it("should return empty value from EMPTY_CELL_VALUES for null/undefined", () => {
            expect(formatCellValue(null, "text")).toBe("");
            expect(formatCellValue(undefined, "date")).toBe("");
        });

        it("should handle invalid date values", () => {
            const originalSetting = moment.suppressDeprecationWarnings;
            moment.suppressDeprecationWarnings = true;

            // formatDate might throw if moment fails to parse, though moment is usually lenient.
            // But let's test the try-catch block in formatCellValue.
            // We can try to mock formatDate to throw.
            // Or just pass something that might cause issues if not a string.
            expect(formatCellValue("invalid-date", "date")).toBe("Invalid date"); // moment parses "invalid-date" as invalid but format() still returns something or "Invalid date"

            moment.suppressDeprecationWarnings = originalSetting;
        });
    });

    describe("formatWorkspaceUserFilterOptions", () => {
        const mockIsCurrentUser = (login: string) => login === "current@example.com";

        it("should format organization users", () => {
            const users = [
                {
                    id: "u1",
                    email: "user1@example.com",
                    fullName: "User One",
                    ref: idRef("u1"),
                },
                {
                    id: "u2",
                    email: "current@example.com",
                    fullName: "Current User",
                    ref: idRef("u2"),
                },
            ] as IOrganizationUser[];

            const options = formatWorkspaceUserFilterOptions(users, mockIsCurrentUser, mockIntl);

            expect(options).toEqual([
                {
                    value: "u1",
                    label: "User One",
                    secondaryLabel: "user1@example.com",
                },
                {
                    value: "u2",
                    label: "currentUser", // mocked intl returns id
                    secondaryLabel: "current@example.com",
                },
            ]);
        });

        it("should format workspace users", () => {
            const users = [
                {
                    uri: "/user1",
                    login: "user1@example.com",
                    fullName: "User One",
                    email: "user1@example.com",
                    ref: uriRef("/user1"),
                },
            ] as IWorkspaceUser[];

            const options = formatWorkspaceUserFilterOptions(users, mockIsCurrentUser, mockIntl);

            expect(options).toEqual([
                {
                    value: "/user1",
                    label: "User One",
                    secondaryLabel: "user1@example.com",
                },
            ]);
        });

        it("should handle users with only email", () => {
            const users = [
                {
                    id: "u1",
                    email: "user1@example.com",
                    ref: idRef("u1"),
                },
            ] as IOrganizationUser[];

            const options = formatWorkspaceUserFilterOptions(users, mockIsCurrentUser, mockIntl);

            expect(options[0]).toEqual({
                value: "u1",
                label: "user1@example.com",
                secondaryLabel: undefined,
            });
        });

        it("should handle users with only identifier ref", () => {
            const users = [
                {
                    id: "u1",
                    ref: idRef("user-id-ref"),
                },
            ] as IOrganizationUser[];

            const options = formatWorkspaceUserFilterOptions(users, mockIsCurrentUser, mockIntl);

            expect(options[0]).toEqual({
                value: "u1",
                label: "user-id-ref",
                secondaryLabel: undefined,
            });
        });

        it("should handle untitled users", () => {
            const users = [
                {
                    id: "u1",
                    ref: uriRef("/uri-ref"),
                },
            ] as IOrganizationUser[];

            const options = formatWorkspaceUserFilterOptions(users, mockIsCurrentUser, mockIntl);

            expect(options[0]).toEqual({
                value: "u1",
                label: "untitledUser",
                secondaryLabel: undefined,
            });
        });
    });
});
