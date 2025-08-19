// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { getHelpMenuFeatureFlagsMock } from "./mock.js";
import { generateHeaderHelpMenuItems } from "../generateHeaderHelpMenuItems.js";

describe("generateHeaderHelpMenuItems", () => {
    it("should return documentation, portal and ticket item if documentationUrl and supportForumUrl is specified", () => {
        const items = generateHeaderHelpMenuItems(
            "https://test.gooddata.com/documentation",
            "https://test.gooddata.com/support",
            "test@gooddata.com",
            "TestWorkspaceId",
            "TestSessionId",
            "supportEmail@gooddata.com",
            true,
            getHelpMenuFeatureFlagsMock(true, true),
        );
        expect(items).toEqual([
            {
                className: "s-documentation",
                href: "https://test.gooddata.com/documentation",
                key: "gs.header.documentation",
                target: "_blank",
            },
            {
                className: "s-support-portal",
                href: "https://test.gooddata.com/support",
                key: "gs.header.visitSupportPortal",
                target: "_blank",
            },
            {
                className: "s-submit-ticket",
                href: "mailto:supportEmail@gooddata.com",
                key: "gs.header.submitTicket",
                target: "_blank",
            },
        ]);
    });

    it("should not return documentation item if documentationUrl is not specified", () => {
        const items = generateHeaderHelpMenuItems(
            undefined,
            "https://test.gooddata.com/support",
            "test@gooddata.com",
            "TestWorkspaceId",
            "TestSessionId",
            "supportEmail@gooddata.com",
            true,
            getHelpMenuFeatureFlagsMock(true, true),
        );
        expect(items).toEqual([
            {
                className: "s-support-portal",
                href: "https://test.gooddata.com/support",
                key: "gs.header.visitSupportPortal",
                target: "_blank",
            },
            {
                className: "s-submit-ticket",
                href: "mailto:supportEmail@gooddata.com",
                key: "gs.header.submitTicket",
                target: "_blank",
            },
        ]);
    });

    it("should return university item if isBranded is false", () => {
        const items = generateHeaderHelpMenuItems(
            undefined,
            "https://test.gooddata.com/support",
            "test@gooddata.com",
            "TestWorkspaceId",
            "TestSessionId",
            "supportEmail@gooddata.com",
            false,
            getHelpMenuFeatureFlagsMock(true, true),
        );
        expect(items).toEqual([
            {
                className: "s-university",
                href: "https://university.gooddata.com?utm_medium=platform&utm_source=product&utm_content=main_menu_help_university",
                key: "gs.header.university",
                target: "_blank",
            },
            {
                className: "s-community",
                href: "https://community.gooddata.com?utm_medium=platform&utm_source=product&utm_content=main_menu_help_community",
                key: "gs.header.community",
                target: "_blank",
            },
            {
                className: "s-support-portal",
                href: "https://test.gooddata.com/support?utm_medium=platform&utm_source=product&utm_content=main_menu_help_support",
                key: "gs.header.visitSupportPortal",
                target: "_blank",
            },
            {
                className: "s-submit-ticket",
                href: "https://support.gooddata.com/hc/en-us/requests/new?ticket_form_id=582387#sessionID=TestSessionId&projectID=TestWorkspaceId&email=test%40gooddata.com&url=http%3A%2F%2Flocalhost%3A3000%2F&utm_medium=platform&utm_source=product&utm_content=main_menu_help_ticket",
                key: "gs.header.submitTicket",
                target: "_blank",
            },
        ]);
    });

    it("should not return university item if isBranded is false", () => {
        const items = generateHeaderHelpMenuItems(
            undefined,
            "https://test.gooddata.com/support",
            "test@gooddata.com",
            "TestWorkspaceId",
            "TestSessionId",
            "supportEmail@gooddata.com",
            true,
            getHelpMenuFeatureFlagsMock(true, true),
        );
        expect(items).toEqual([
            {
                className: "s-support-portal",
                href: "https://test.gooddata.com/support",
                key: "gs.header.visitSupportPortal",
                target: "_blank",
            },
            {
                className: "s-submit-ticket",
                href: "mailto:supportEmail@gooddata.com",
                key: "gs.header.submitTicket",
                target: "_blank",
            },
        ]);
    });

    it("should return community item if enableCommunityHelpMenuItem is true", () => {
        const items = generateHeaderHelpMenuItems(
            undefined,
            "https://test.gooddata.com/support",
            "test@gooddata.com",
            "TestWorkspaceId",
            "TestSessionId",
            "supportEmail@gooddata.com",
            false,
            getHelpMenuFeatureFlagsMock(true, true),
        );
        expect(items).toEqual([
            {
                className: "s-university",
                href: "https://university.gooddata.com?utm_medium=platform&utm_source=product&utm_content=main_menu_help_university",
                key: "gs.header.university",
                target: "_blank",
            },
            {
                className: "s-community",
                href: "https://community.gooddata.com?utm_medium=platform&utm_source=product&utm_content=main_menu_help_community",
                key: "gs.header.community",
                target: "_blank",
            },
            {
                className: "s-support-portal",
                href: "https://test.gooddata.com/support?utm_medium=platform&utm_source=product&utm_content=main_menu_help_support",
                key: "gs.header.visitSupportPortal",
                target: "_blank",
            },
            {
                className: "s-submit-ticket",
                href: "https://support.gooddata.com/hc/en-us/requests/new?ticket_form_id=582387#sessionID=TestSessionId&projectID=TestWorkspaceId&email=test%40gooddata.com&url=http%3A%2F%2Flocalhost%3A3000%2F&utm_medium=platform&utm_source=product&utm_content=main_menu_help_ticket",
                key: "gs.header.submitTicket",
                target: "_blank",
            },
        ]);
    });

    it("should not return community item if enableCommunityHelpMenuItem is false", () => {
        const items = generateHeaderHelpMenuItems(
            undefined,
            "https://test.gooddata.com/support",
            "test@gooddata.com",
            "TestWorkspaceId",
            "TestSessionId",
            "supportEmail@gooddata.com",
            true,
            getHelpMenuFeatureFlagsMock(true, false),
        );
        expect(items).toEqual([
            {
                className: "s-support-portal",
                href: "https://test.gooddata.com/support",
                key: "gs.header.visitSupportPortal",
                target: "_blank",
            },
            {
                className: "s-submit-ticket",
                href: "mailto:supportEmail@gooddata.com",
                key: "gs.header.submitTicket",
                target: "_blank",
            },
        ]);
    });

    it("should not return support item if supportForumUrl is not specified", () => {
        const items = generateHeaderHelpMenuItems(
            undefined,
            undefined,
            "test@gooddata.com",
            "TestWorkspaceId",
            "TestSessionId",
            "supportEmail@gooddata.com",
            true,
            getHelpMenuFeatureFlagsMock(true, false),
        );
        expect(items).toEqual([
            {
                className: "s-submit-ticket",
                href: "mailto:supportEmail@gooddata.com",
                key: "gs.header.submitTicket",
                target: "_blank",
            },
        ]);
    });
});
