// (C) 2026 GoodData Corporation

import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type GenAIObjectType } from "@gooddata/sdk-model";

import { ConfigProvider, useConfig } from "./ConfigContext.js";

function PolicyProbe() {
    const { isLinkEnabled } = useConfig();

    return <output>{isLinkEnabled ? String(isLinkEnabled("metric")) : "unset"}</output>;
}

describe("ConfigProvider object-link policy", () => {
    it("leaves the policy unset without a provider", () => {
        const { result } = renderHook(useConfig);

        expect(result.current.isLinkEnabled).toBeUndefined();
    });

    it("leaves the policy unset when no provider supplies one", () => {
        const { result } = renderHook(useConfig, {
            wrapper: ({ children }) => (
                <ConfigProvider>
                    <ConfigProvider>{children}</ConfigProvider>
                </ConfigProvider>
            ),
        });

        expect(result.current.isLinkEnabled).toBeUndefined();
    });

    it("exposes the supplied predicate unchanged for every object type", () => {
        const isLinkEnabled = (type: GenAIObjectType) => type !== "metric";
        const { result } = renderHook(useConfig, {
            wrapper: ({ children }) => (
                <ConfigProvider isLinkEnabled={isLinkEnabled}>{children}</ConfigProvider>
            ),
        });

        expect(result.current.isLinkEnabled).toBe(isLinkEnabled);
        expect(result.current.isLinkEnabled?.("metric")).toBe(false);
        expect(result.current.isLinkEnabled?.("visualization")).toBe(true);
        expect(result.current.isLinkEnabled?.("dashboard")).toBe(true);
        expect(result.current.isLinkEnabled?.("document")).toBe(true);
    });

    it("inherits the nearest supplied predicate through nested providers", () => {
        const isLinkEnabled = () => false;
        const { result } = renderHook(useConfig, {
            wrapper: ({ children }) => (
                <ConfigProvider isLinkEnabled={isLinkEnabled}>
                    <ConfigProvider>
                        <ConfigProvider isLinkEnabled={undefined}>{children}</ConfigProvider>
                    </ConfigProvider>
                </ConfigProvider>
            ),
        });

        expect(result.current.isLinkEnabled).toBe(isLinkEnabled);
        expect(result.current.isLinkEnabled?.("metric")).toBe(false);
    });

    it("replaces the parent predicate instead of combining the policies", () => {
        const parentPolicy = () => false;
        const childPolicy = () => true;
        const { result } = renderHook(useConfig, {
            wrapper: ({ children }) => (
                <ConfigProvider isLinkEnabled={parentPolicy}>
                    <ConfigProvider isLinkEnabled={childPolicy}>
                        <ConfigProvider>{children}</ConfigProvider>
                    </ConfigProvider>
                </ConfigProvider>
            ),
        });

        expect(result.current.isLinkEnabled).toBe(childPolicy);
        expect(result.current.isLinkEnabled?.("metric")).toBe(true);
    });

    it("updates consumers when the predicate changes or is removed", () => {
        const enabled = () => true;
        const disabled = () => false;
        const view = (isLinkEnabled?: (type: GenAIObjectType) => boolean) => (
            <ConfigProvider isLinkEnabled={isLinkEnabled}>
                <PolicyProbe />
            </ConfigProvider>
        );
        const { rerender } = render(view(enabled));

        expect(screen.getByRole("status")).toHaveTextContent("true");

        rerender(view(disabled));
        expect(screen.getByRole("status")).toHaveTextContent("false");

        rerender(view());
        expect(screen.getByRole("status")).toHaveTextContent("unset");
    });

    it("updates inherited policies and restores inheritance when an override is removed", () => {
        const enabled = () => true;
        const disabled = () => false;
        const view = (
            parentPolicy?: (type: GenAIObjectType) => boolean,
            childPolicy?: (type: GenAIObjectType) => boolean,
        ) => (
            <ConfigProvider isLinkEnabled={parentPolicy}>
                <ConfigProvider isLinkEnabled={childPolicy}>
                    <PolicyProbe />
                </ConfigProvider>
            </ConfigProvider>
        );
        const { rerender } = render(view(enabled));

        expect(screen.getByRole("status")).toHaveTextContent("true");

        rerender(view(disabled));
        expect(screen.getByRole("status")).toHaveTextContent("false");

        rerender(view(disabled, enabled));
        expect(screen.getByRole("status")).toHaveTextContent("true");

        rerender(view(disabled));
        expect(screen.getByRole("status")).toHaveTextContent("false");

        rerender(view());
        expect(screen.getByRole("status")).toHaveTextContent("unset");
    });
});
