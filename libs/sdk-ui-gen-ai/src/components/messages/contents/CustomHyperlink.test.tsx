// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    setSettingsAction,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";
import { type ConfigContext, ConfigProvider, type LinkHandlerEvent } from "../../ConfigContext.js";

import { CustomHyperlink, CustomHyperlinkComponent } from "./CustomHyperlink.js";

const plainText = "http://www.seznam.cz";

type RenderCustomHyperlinkOptions = {
    href?: string;
    text?: string;
    allowNativeLinks?: boolean;
    isLinkEnabled?: ConfigContext["isLinkEnabled"];
    canManage?: boolean;
    canAnalyze?: boolean;
    canCreateDocument?: boolean;
    reportsAppEnabled?: boolean;
    publisherV2Enabled?: boolean;
    linkHandler?: (event: LinkHandlerEvent) => string | undefined;
};

function renderCustomHyperlinkComponent({
    href = "gooddata://dashboard?ws=workspace_1&id=dashboard_1",
    text = plainText,
    allowNativeLinks = true,
    canManage = true,
    canAnalyze = false,
    canCreateDocument = true,
    reportsAppEnabled = true,
    publisherV2Enabled = true,
    linkHandler,
    isLinkEnabled,
}: RenderCustomHyperlinkOptions = {}) {
    return render(
        <ConfigProvider
            allowNativeLinks={allowNativeLinks}
            canManage={canManage}
            canAnalyze={canAnalyze}
            canCreateDocument={canCreateDocument}
            linkHandler={linkHandler}
            isLinkEnabled={isLinkEnabled}
        >
            <CustomHyperlinkComponent
                href={href}
                text={text}
                reportsAppEnabled={reportsAppEnabled}
                publisherV2Enabled={publisherV2Enabled}
            />
        </ConfigProvider>,
    );
}

describe("CustomHyperlinkComponent", () => {
    describe.each([true, false])("link policy with native links %s", (allowNativeLinks) => {
        it.each(["metric", "visualization", "dashboard", "report"])(
            "renders disabled %s references as text without activation",
            (type) => {
                const linkHandler = vi.fn();
                const isLinkEnabled = vi.fn(() => false);
                const { container } = renderCustomHyperlinkComponent({
                    href: `gooddata://${type}?ws=workspace_1&id=object_1`,
                    allowNativeLinks,
                    linkHandler,
                    isLinkEnabled,
                });

                expect(container.textContent).toBe(plainText);
                expect(container.querySelector("a, span, .gd-hyperlink, .gd-hyperlink-text")).toBeNull();
                fireEvent.click(container);
                fireEvent.click(container, { metaKey: true, ctrlKey: true });
                fireEvent(container, new MouseEvent("auxclick", { button: 1, bubbles: true }));
                fireEvent.keyDown(container, { key: "Enter" });
                fireEvent.keyDown(container, { key: " " });
                expect(linkHandler).not.toHaveBeenCalled();
                expect(isLinkEnabled).toHaveBeenCalledWith(type === "report" ? "document" : type);
            },
        );

        it.each(["metric", "visualization", "dashboard", "report"])(
            "preserves enabled %s reference markup and event types",
            (type) => {
                const linkHandler = vi.fn();
                const { container } = renderCustomHyperlinkComponent({
                    href: `gooddata://${type}?ws=workspace_1&id=object_1`,
                    allowNativeLinks,
                    linkHandler,
                    isLinkEnabled: () => true,
                });
                const link = container.querySelector(".gd-hyperlink")!;
                expect(link.tagName).toBe(allowNativeLinks ? "A" : "SPAN");
                fireEvent.click(link);
                expect(linkHandler).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type,
                        id: "object_1",
                        workspaceId: "workspace_1",
                        action: "open",
                    }),
                );
            },
        );

        it.each(["metric", "visualization", "report"])("does not override %s permissions", (type) => {
            const isLinkEnabled = vi.fn(() => true);
            const { container } = renderCustomHyperlinkComponent({
                href: `gooddata://${type}?ws=workspace_1&id=object_1`,
                allowNativeLinks,
                canManage: false,
                canAnalyze: false,
                canCreateDocument: false,
                isLinkEnabled,
            });
            expect(container.querySelector(".gd-hyperlink")).toBeNull();
            expect(isLinkEnabled).not.toHaveBeenCalled();
        });

        it("does not enable unsupported references", () => {
            const isLinkEnabled = vi.fn(() => true);
            const { container } = renderCustomHyperlinkComponent({
                href: "gooddata://dataset?ws=workspace_1&id=object_1",
                allowNativeLinks,
                isLinkEnabled,
            });
            expect(container.querySelector(".gd-hyperlink")).toBeNull();
            expect(isLinkEnabled).not.toHaveBeenCalled();
        });
    });
    it.each([
        ["empty href", ""],
        ["malformed encoded href", "%E0%A4%A"],
        ["not an URL", "not-a-url"],
        ["unsupported protocol", "https://www.gooddata.com/?ws=workspace_1&id=dashboard_1"],
        ["missing workspace", "gooddata://dashboard?id=dashboard_1"],
        ["missing id", "gooddata://dashboard?ws=workspace_1"],
        ["unsupported object type", "gooddata://dataset?ws=workspace_1&id=dataset_1"],
    ])("renders plain text and no link for %s", (_description, href) => {
        renderCustomHyperlinkComponent({ href });

        expect(screen.getByText(plainText)).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders plain text for metric when user cannot manage or analyze", () => {
        renderCustomHyperlinkComponent({
            href: "gooddata://metric?ws=workspace_1&id=metric_1",
            canManage: false,
            canAnalyze: false,
        });

        expect(screen.getByText(plainText)).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders plain text for visualization when user cannot manage or analyze", () => {
        renderCustomHyperlinkComponent({
            href: "gooddata://visualization?ws=workspace_1&id=insight_1",
            canManage: false,
            canAnalyze: false,
        });

        expect(screen.getByText(plainText)).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders report link when user may create documents without managing the workspace", () => {
        renderCustomHyperlinkComponent({
            href: "gooddata://report?ws=workspace_1&id=report_1",
            canManage: false,
            canCreateDocument: true,
        });

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/workspace/workspace_1/reports/report/report_1",
        );
    });

    it("renders plain text for report when user cannot create documents", () => {
        renderCustomHyperlinkComponent({
            href: "gooddata://report?ws=workspace_1&id=report_1",
            canManage: true,
            canCreateDocument: false,
        });

        expect(screen.getByText(plainText)).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders document link when user cannot create documents", () => {
        renderCustomHyperlinkComponent({
            href: "gooddata://document?ws=workspace_1&id=document_1",
            canManage: false,
            canAnalyze: false,
            canCreateDocument: false,
        });

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/workspace/workspace_1/reports/document/document_1",
        );
    });

    it.each([
        ["document", "gooddata://document?ws=workspace_1&id=document_1"],
        ["report", "gooddata://report?ws=workspace_1&id=report_1"],
    ])("renders plain text for %s when the Reports app is off", (_description, href) => {
        renderCustomHyperlinkComponent({ href, reportsAppEnabled: false });

        expect(screen.getByText(plainText)).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders plain text for document when Publisher v2 is off", () => {
        renderCustomHyperlinkComponent({
            href: "gooddata://document?ws=workspace_1&id=document_1",
            publisherV2Enabled: false,
        });

        expect(screen.getByText(plainText)).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("calls linkHandler with document type for document link", () => {
        const linkHandler = vi.fn((_event: LinkHandlerEvent) => undefined);
        renderCustomHyperlinkComponent({
            href: "gooddata://document?ws=workspace_1&id=document_1",
            linkHandler,
        });

        fireEvent.click(screen.getByRole("link"));

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "document",
                id: "document_1",
                workspaceId: "workspace_1",
                itemUrl: "/workspace/workspace_1/reports/document/document_1",
            }),
        );
    });

    it("renders metric link when user can analyze", () => {
        renderCustomHyperlinkComponent({
            href: "gooddata://metric?ws=workspace_1&id=metric_1",
            canManage: false,
            canAnalyze: true,
        });

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/workspace/workspace_1/metrics/metric/metric_1",
        );
    });

    it.each<[string, string, string]>([
        [
            "dashboard",
            "gooddata://dashboard?ws=workspace_1&id=dashboard_1",
            "/workspace/workspace_1/dashboards/#/dashboard/dashboard_1",
        ],
        [
            "visualization",
            "gooddata://visualization?ws=workspace_1&id=insight_1",
            "/workspace/workspace_1/analyze/#/insight_1/edit",
        ],
        [
            "metric",
            "gooddata://metric?ws=workspace_1&id=metric_1",
            "/workspace/workspace_1/metrics/metric/metric_1",
        ],
        [
            "report",
            "gooddata://report?ws=workspace_1&id=report/1",
            "/workspace/workspace_1/reports/report/report%2F1",
        ],
        [
            "document",
            "gooddata://document?ws=workspace_1&id=document/1",
            "/workspace/workspace_1/reports/document/document%2F1",
        ],
    ])("renders native link for %s", (_description, href, expectedHref) => {
        renderCustomHyperlinkComponent({ href, allowNativeLinks: true });

        expect(screen.getByRole("link")).toHaveAttribute("href", expectedHref);
        expect(screen.getByText(plainText)).toBeInTheDocument();
    });

    it("renders non-native clickable span when native links are disabled", () => {
        const { container } = renderCustomHyperlinkComponent({ allowNativeLinks: false });

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        const hyperlinkElement = container.querySelector(".gd-hyperlink");
        expect(hyperlinkElement).toBeInTheDocument();
        expect(hyperlinkElement?.tagName.toLowerCase()).toBe("span");
    });

    it("makes the non-native link focusable", () => {
        renderCustomHyperlinkComponent({ allowNativeLinks: false });

        expect(screen.getByRole("button")).toHaveAttribute("tabindex", "0");
    });

    it.each(["Enter", " "])("opens the non-native link with the %j key", (key) => {
        const linkHandler = vi.fn((_event: LinkHandlerEvent) => undefined);
        renderCustomHyperlinkComponent({ allowNativeLinks: false, linkHandler });

        fireEvent.keyDown(screen.getByRole("button"), { key });

        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({ type: "dashboard", id: "dashboard_1", newTab: false }),
        );
    });

    it("ignores other keys on the non-native link", () => {
        const linkHandler = vi.fn((_event: LinkHandlerEvent) => undefined);
        renderCustomHyperlinkComponent({ allowNativeLinks: false, linkHandler });

        fireEvent.keyDown(screen.getByRole("button"), { key: "a" });

        expect(linkHandler).not.toHaveBeenCalled();
    });

    it("keeps an encoded ampersand inside the id", () => {
        const linkHandler = vi.fn((_event: LinkHandlerEvent) => undefined);
        renderCustomHyperlinkComponent({
            href: "gooddata://document?ws=workspace_1&id=d%261",
            canCreateDocument: false,
            linkHandler,
        });

        fireEvent.click(screen.getByRole("link"));

        expect(linkHandler).toHaveBeenCalledWith(expect.objectContaining({ type: "document", id: "d&1" }));
    });

    it("calls linkHandler with complete event payload on click", () => {
        const linkHandler = vi.fn((_event: LinkHandlerEvent) => undefined);
        renderCustomHyperlinkComponent({ linkHandler });

        fireEvent.click(screen.getByRole("link"), { metaKey: true });

        expect(linkHandler).toHaveBeenCalledTimes(1);
        expect(linkHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "dashboard",
                id: "dashboard_1",
                workspaceId: "workspace_1",
                itemUrl: "/workspace/workspace_1/dashboards/#/dashboard/dashboard_1",
                newTab: true,
                action: "open",
            }),
        );

        const event = linkHandler.mock.calls[0][0];
        expect(event.preventDefault).toEqual(expect.any(Function));
    });

    it("does not fail when linkHandler is not provided", () => {
        renderCustomHyperlinkComponent({ linkHandler: undefined });

        expect(() => fireEvent.click(screen.getByRole("link"))).not.toThrow();
    });

    it("supports URL-encoded gooddata links", () => {
        renderCustomHyperlinkComponent({
            href: encodeURIComponent("gooddata://dashboard?ws=workspace_1&id=dashboard_1"),
        });

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/workspace/workspace_1/dashboards/#/dashboard/dashboard_1",
        );
    });

    it("load URL-encoded http links, but change them to plain text", () => {
        renderCustomHyperlinkComponent({
            href: encodeURIComponent("http://www\\.seznam\\.cz"),
        });

        expect(screen.getByText("http://www.seznam.cz")).toBeInTheDocument();
    });
});

describe("CustomHyperlink", () => {
    const DOCUMENT_HREF = "gooddata://document?ws=workspace_1&id=document_1";

    function renderWithSettings(settings: Partial<IUserWorkspaceSettings>) {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
        });
        store.dispatch(
            setSettingsAction({
                settings: {
                    userId: "user-1",
                    workspace: "workspace_1",
                    locale: "en-US",
                    separators: { thousand: ",", decimal: "." },
                    ...settings,
                },
            }),
        );
        return render(
            <Provider store={store}>
                <ConfigProvider allowNativeLinks>
                    <CustomHyperlink href={DOCUMENT_HREF} text={plainText} />
                </ConfigProvider>
            </Provider>,
        );
    }

    it("renders a document link when the workspace settings enable the Reports app and Publisher v2", () => {
        renderWithSettings({ enableBusinessBriefingReportsApp: true, enablePublisherV2: true });

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/workspace/workspace_1/reports/document/document_1",
        );
    });

    it.each([
        ["the Reports app", { enableBusinessBriefingReportsApp: false, enablePublisherV2: true }],
        ["Publisher v2", { enableBusinessBriefingReportsApp: true, enablePublisherV2: false }],
    ])("renders a document as plain text when the workspace settings turn off %s", (_d, settings) => {
        renderWithSettings(settings);

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
});
