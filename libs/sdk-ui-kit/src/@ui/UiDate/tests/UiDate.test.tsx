// (C) 2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_ABSOLUTE_OPTIONS, UiDate, UiDateProps } from "../UiDate.js";

describe("UiDate", () => {
    const renderDate = (
        date: Date,
        props: Partial<UiDateProps> = {
            locale: "en-US",
        },
    ) => {
        return render(<UiDate date={date} {...props} />);
    };

    it("should render simple date, relative enabled, now", () => {
        renderDate(new Date());

        expect(screen.getByRole("time")).toHaveTextContent("now");
    });

    it("should render simple date, relative enabled, 1 min ago", () => {
        renderDate(new Date(new Date().getTime() - 1000 * 65));

        expect(screen.getByRole("time")).toHaveTextContent("1 minute ago");
    });

    it("should render simple date, relative enabled, 1 hour ago", () => {
        renderDate(new Date(new Date().getTime() - 1000 * 60 * 60 - 1000));

        expect(screen.getByRole("time")).toHaveTextContent("1 hour ago");
    });

    it("should render simple date, relative enabled, 6 hours ago", () => {
        renderDate(new Date(new Date().getTime() - 1000 * 60 * 60 * 6 - 1000));

        expect(screen.getByRole("time")).toHaveTextContent("6 hours ago");
    });

    it("should render simple date, relative enabled, 12 hours ago", () => {
        renderDate(new Date(new Date().getTime() - 1000 * 60 * 60 * 12 - 1000));

        expect(screen.getByRole("time")).toHaveTextContent("12 hours ago");
    });

    it("should render simple date, relative enabled, absolute day after 24 hours", () => {
        const date = new Date(new Date().getTime() - 1000 * 60 * 60 * 25);
        renderDate(date);

        expect(screen.getByRole("time")).toHaveTextContent(
            date.toLocaleString("en-US", DEFAULT_ABSOLUTE_OPTIONS),
        );
    });

    it("should render simple date, relative enabled, 1 min ago, short threshold", () => {
        const date = new Date(new Date().getTime() - 1000 * 65);
        renderDate(date, {
            relativeThresholdMs: 5000,
        });

        expect(screen.getByRole("time")).toHaveTextContent(
            date.toLocaleString("en-US", DEFAULT_ABSOLUTE_OPTIONS),
        );
    });

    it("should render simple date, relative disabled, now", () => {
        const date = new Date();
        renderDate(date, {
            allowRelative: false,
        });

        expect(screen.getByRole("time")).toHaveTextContent(
            date.toLocaleString("en-US", DEFAULT_ABSOLUTE_OPTIONS),
        );
    });
});
