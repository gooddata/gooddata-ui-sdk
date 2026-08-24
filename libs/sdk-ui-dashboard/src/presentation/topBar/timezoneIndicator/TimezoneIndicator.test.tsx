// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BROWSER_DETECTED, type IDashboardTimezoneConfig } from "@gooddata/sdk-model";

import { IntlWrapper } from "../../localization/IntlWrapper.js";

import { TimezoneIndicator } from "./TimezoneIndicator.js";
import { type IDashboardTimezoneInfo } from "./types.js";

function renderIndicator(
    timezoneConfig?: IDashboardTimezoneConfig,
    timezone?: IDashboardTimezoneInfo,
    defaultTimezone?: string,
) {
    return render(
        <IntlWrapper>
            <TimezoneIndicator
                timezoneConfig={timezoneConfig}
                timezone={timezone}
                defaultTimezone={defaultTimezone}
            />
        </IntlWrapper>,
    );
}

function getBadge(container: HTMLElement): HTMLElement | null {
    return container.querySelector(".s-timezone-indicator");
}

describe("TimezoneIndicator", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders only the friendly timezone name in the badge, without the offset", () => {
        const { container } = renderIndicator(
            { timezoneId: "Europe/Prague", showTimezoneInfo: true },
            { timezoneId: "Europe/Prague", name: "Prague", offsetLabel: "GMT+02:00" },
        );

        expect(getBadge(container)).toHaveTextContent("Prague");
        expect(getBadge(container)!.textContent).not.toContain("GMT+02:00");
    });

    it("renders the provided resolved timezone data in preference to the config", () => {
        const { container } = renderIndicator(
            { timezoneId: "Europe/Prague", showTimezoneInfo: true },
            { timezoneId: "America/New_York", name: "New York", offsetLabel: "GMT-04:00" },
        );

        expect(getBadge(container)).toHaveTextContent("New York");
        expect(screen.queryByText("Prague")).not.toBeInTheDocument();
    });

    it("resolves the timezone from the config when no resolved data is provided", () => {
        const { container } = renderIndicator({ timezoneId: "Europe/Prague", showTimezoneInfo: true });

        expect(getBadge(container)).toHaveTextContent("Prague");
    });

    it("renders the browser detected timezone when the sentinel is used", () => {
        vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
            timeZone: "Europe/Prague",
        } as Intl.ResolvedDateTimeFormatOptions);

        renderIndicator({ timezoneId: BROWSER_DETECTED, showTimezoneInfo: true });

        expect(screen.getByText("Prague")).toBeInTheDocument();
    });

    it("renders nothing when showTimezoneInfo is not enabled", () => {
        const { container } = renderIndicator({ timezoneId: "Europe/Prague", showTimezoneInfo: false });

        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing when there is no timezone config", () => {
        const { container } = renderIndicator(undefined);

        expect(container).toBeEmptyDOMElement();
    });

    it("renders the effective workspace or organization timezone when no dashboard timezone is set", () => {
        const { container } = renderIndicator(
            { timezoneId: undefined, showTimezoneInfo: true },
            undefined,
            "Europe/Prague",
        );

        expect(getBadge(container)).toHaveTextContent("Prague");
    });

    it("renders nothing for the workspace default timezone when the effective timezone is unavailable", () => {
        const { container } = renderIndicator({ timezoneId: undefined, showTimezoneInfo: true });

        expect(container).toBeEmptyDOMElement();
    });
});
