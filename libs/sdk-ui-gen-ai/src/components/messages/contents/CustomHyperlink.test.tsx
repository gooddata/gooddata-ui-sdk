// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { ConfigProvider, type LinkHandlerEvent } from "../../ConfigContext.js";

import { CustomHyperlinkComponent } from "./CustomHyperlink.js";

const escapedText = "http://www\\.seznam\\.cz";
const plainText = "http://www.seznam.cz";

type RenderCustomHyperlinkOptions = {
    href?: string;
    text?: string;
    allowNativeLinks?: boolean;
    canManage?: boolean;
    canAnalyze?: boolean;
    linkHandler?: (event: LinkHandlerEvent) => string | undefined;
    settings?: IUserWorkspaceSettings;
};

function renderCustomHyperlinkComponent({
    href = "gooddata://dashboard?ws=workspace_1&id=dashboard_1",
    text = escapedText,
    allowNativeLinks = true,
    canManage = true,
    canAnalyze = false,
    linkHandler,
    settings,
}: RenderCustomHyperlinkOptions = {}) {
    return render(
        <ConfigProvider
            allowNativeLinks={allowNativeLinks}
            canManage={canManage}
            canAnalyze={canAnalyze}
            linkHandler={linkHandler}
        >
            <CustomHyperlinkComponent href={href} text={text} settings={settings} />
        </ConfigProvider>,
    );
}

describe("CustomHyperlinkComponent", () => {
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

    it.each<[string, string, Partial<IUserWorkspaceSettings>, string]>([
        [
            "dashboard using legacy shell URL",
            "gooddata://dashboard?ws=workspace_1&id=dashboard_1",
            {},
            "/dashboards/#/workspace/workspace_1/dashboard/dashboard_1",
        ],
        [
            "dashboard using workspace shell URL",
            "gooddata://dashboard?ws=workspace_1&id=dashboard_1",
            { enableShellApplication_dashboards: true },
            "/workspace/workspace_1/dashboards/#/dashboard/dashboard_1",
        ],
        [
            "visualization using legacy shell URL",
            "gooddata://visualization?ws=workspace_1&id=insight_1",
            {},
            "/analyze/#/workspace_1/insight_1/edit",
        ],
        [
            "visualization using workspace shell URL",
            "gooddata://visualization?ws=workspace_1&id=insight_1",
            { enableShellApplication_analyticalDesigner: true },
            "/workspace/workspace_1/analyze/#/insight_1/edit",
        ],
        [
            "metric",
            "gooddata://metric?ws=workspace_1&id=metric_1",
            {},
            "/workspace/workspace_1/metrics/metric/metric_1",
        ],
    ])("renders native link for %s", (_description, href, settings, expectedHref) => {
        renderCustomHyperlinkComponent({
            href,
            allowNativeLinks: true,
            settings: settings as IUserWorkspaceSettings,
        });

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
                itemUrl: "/dashboards/#/workspace/workspace_1/dashboard/dashboard_1",
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
            "/dashboards/#/workspace/workspace_1/dashboard/dashboard_1",
        );
    });

    it("load URL-encoded http links, but change them to plain text", () => {
        renderCustomHyperlinkComponent({
            href: encodeURIComponent("http://www\\.seznam\\.cz"),
        });

        expect(screen.getByText("http://www.seznam.cz")).toBeInTheDocument();
    });
});
