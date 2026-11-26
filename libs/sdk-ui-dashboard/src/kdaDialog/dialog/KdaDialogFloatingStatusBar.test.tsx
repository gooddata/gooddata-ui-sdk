// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { createInternalIntl } from "../../presentation/localization/createInternalIntl.js";

import { KdaDialogStatusAnnouncer } from "./KdaDialogFloatingStatusBar.js";

const TITLE = "Key driver analysis for Revenue";

type Status = "step01" | "step02" | "done" | "error";

function renderAnnouncer(status: Status, isMinimized = true) {
    const intl = createInternalIntl();
    const result = render(
        <RawIntlProvider value={intl}>
            <KdaDialogStatusAnnouncer dialogTitle={TITLE} status={status} isMinimized={isMinimized} />
        </RawIntlProvider>,
    );
    const rerender = (nextStatus: Status, nextIsMinimized = isMinimized) =>
        result.rerender(
            <RawIntlProvider value={intl}>
                <KdaDialogStatusAnnouncer
                    dialogTitle={TITLE}
                    status={nextStatus}
                    isMinimized={nextIsMinimized}
                />
            </RawIntlProvider>,
        );
    return { rerender };
}

describe("KdaDialogStatusAnnouncer", () => {
    it("announces completion in the same live region that was there while loading", () => {
        const { rerender } = renderAnnouncer("step01");
        const region = screen.getByRole("status");
        expect(region).toHaveTextContent("");

        rerender("step02");
        expect(screen.getByRole("status")).toBe(region);
        expect(region).toHaveTextContent("");

        rerender("done");
        expect(screen.getByRole("status")).toBe(region);
        expect(region).toHaveTextContent(`${TITLE}: Analysis is ready`);
    });

    it("does not re-insert the text while nothing changes", () => {
        const { rerender } = renderAnnouncer("step02");
        rerender("done");
        const region = screen.getByRole("status");
        const textNode = region.firstChild;

        rerender("done");
        rerender("done", false);
        rerender("done", true);

        expect(screen.getByRole("status")).toBe(region);
        expect(region.firstChild).toBe(textNode);
        expect(region.childNodes).toHaveLength(1);
    });

    it("announces a failure assertively in the alert region that was there while loading", () => {
        const { rerender } = renderAnnouncer("step01");
        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent("");

        rerender("error");
        expect(screen.getByRole("alert")).toBe(alert);
        expect(alert).toHaveTextContent(`${TITLE}: Analysis failed`);
        expect(screen.getByRole("status")).toHaveTextContent("");
    });

    it("keeps completion out of the alert region", () => {
        const { rerender } = renderAnnouncer("step02");
        rerender("done");
        expect(screen.getByRole("alert")).toHaveTextContent("");
    });

    it("announces again after a new computation finishes", () => {
        const { rerender } = renderAnnouncer("step02");
        rerender("done");
        rerender("step01");
        expect(screen.getByRole("status")).toHaveTextContent("");
        rerender("done");
        expect(screen.getByRole("status")).toHaveTextContent(`${TITLE}: Analysis is ready`);
    });

    it("does not announce when the analysis was already finished on mount", () => {
        renderAnnouncer("done");
        expect(screen.getByRole("status")).toHaveTextContent("");
    });

    it("does not announce completion while the dialog is expanded", () => {
        const { rerender } = renderAnnouncer("step02", false);
        rerender("done", false);
        expect(screen.getByRole("status")).toHaveTextContent("");
    });
});
