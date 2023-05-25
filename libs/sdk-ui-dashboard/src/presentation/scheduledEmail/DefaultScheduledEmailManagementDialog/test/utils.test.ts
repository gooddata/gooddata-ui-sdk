// (C) 2022 GoodData Corporation

import { uriRef, IDashboardAttachment, IWidgetAttachment } from "@gooddata/sdk-model";
import { Icon } from "@gooddata/sdk-ui-kit";
import { createInternalIntl } from "../../../localization/index.js";
import { getAttachmentType, getFormatsLabel, getRecipientsLabel } from "../utils.js";
import { describe, it, expect } from "vitest";

describe("Scheduled email management utils", () => {
    const intl = createInternalIntl();

    const csvWidgetAttachment: IWidgetAttachment = {
        widgetDashboard: uriRef("dashboard1"),
        widget: uriRef("widget1"),
        formats: ["csv"],
    };

    const xlsxWidgetAttachment: IWidgetAttachment = {
        widgetDashboard: uriRef("dashboard1"),
        widget: uriRef("widget2"),
        formats: ["xlsx"],
    };

    const pdfDashboardAttachment: IDashboardAttachment = {
        dashboard: uriRef("dashboard1"),
        format: "pdf",
    };

    const currentUserEmail = "john.doe1";
    const oneRecipient = ["john.doe1"];
    const manyRecipients = ["john.doe1", "john.doe2"];

    describe("getRecipientsLabel", () => {
        it("should return correct label when the only recipient is the same as currentUserEmail", () => {
            const result = getRecipientsLabel(intl, oneRecipient, currentUserEmail);

            expect(result).toEqual("Only you");
        });

        it("should return correct label when the only recipient is different from currentUserEmail", () => {
            const result = getRecipientsLabel(intl, oneRecipient, "otherUser");

            expect(result).toEqual("1 recipient");
        });

        it("should return correct label for many recipients", () => {
            const result = getRecipientsLabel(intl, manyRecipients, currentUserEmail);

            expect(result).toEqual("2 recipients");
        });
    });

    describe("getAttachmentType", () => {
        it("should return correct label describing combination of attachments and 'Icon.Many' component when ", () => {
            const result = getAttachmentType(intl, [
                csvWidgetAttachment,
                xlsxWidgetAttachment,
                pdfDashboardAttachment,
            ]);

            expect(result.attachmentLabel).toEqual("Dashboard and 2 insights");
            expect(result.AttachmentIcon).toEqual(Icon.Many);
        });

        it("should return correct label describing number of insight attachments and 'Icon.Insight' component", () => {
            const result = getAttachmentType(intl, [csvWidgetAttachment, xlsxWidgetAttachment]);

            expect(result.attachmentLabel).toEqual("2 insights");
            expect(result.AttachmentIcon).toEqual(Icon.Insight);
        });

        it("should return correct label describing insight attachment and 'Icon.Insight' component", () => {
            const result = getAttachmentType(intl, [csvWidgetAttachment]);

            expect(result.attachmentLabel).toEqual("1 insight");
            expect(result.AttachmentIcon).toEqual(Icon.Insight);
        });

        it("should return correct label describing dashboard attachment and 'Icon.Dashboard' component", () => {
            const result = getAttachmentType(intl, [pdfDashboardAttachment]);

            expect(result.attachmentLabel).toEqual("Dashboard");
            expect(result.AttachmentIcon).toEqual(Icon.Dashboard);
        });
    });

    describe("getFormatsLabel", () => {
        it("should return label with all formats", () => {
            const result = getFormatsLabel([
                csvWidgetAttachment,
                xlsxWidgetAttachment,
                pdfDashboardAttachment,
            ]);

            expect(result).toEqual("PDF, CSV, XLSX");
        });

        it("should return label without PDF format", () => {
            const result = getFormatsLabel([csvWidgetAttachment, xlsxWidgetAttachment]);

            expect(result).toEqual("CSV, XLSX");
        });

        it("should return label without PDF and XLSX format", () => {
            const result = getFormatsLabel([csvWidgetAttachment]);

            expect(result).toEqual("CSV");
        });
    });
});
