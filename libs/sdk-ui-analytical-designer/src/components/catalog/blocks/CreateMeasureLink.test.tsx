// (C) 2020-2026 GoodData Corporation

import { createEvent, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { CreateMeasureLink } from "./CreateMeasureLink.js";

const mountComponent = (disabled = false) => {
    const WrappedCreateMeasureLink = withRedux(withIntl(CreateMeasureLink));
    return render(<WrappedCreateMeasureLink projectId={"test"} disabled={disabled} />);
};

describe("CreateMeasureLink", () => {
    const BASE_CALLS = 1;
    const createClickEvent = (element: Element) => {
        const clickEvent = createEvent.click(element);
        const preventDefaultSpy = vi.spyOn(clickEvent, "preventDefault");
        clickEvent.preventDefault();
        return { clickEvent, preventDefaultSpy };
    };

    // we're calling this in setup, so add BASE_CALLS to the expected count
    const getPreventedCallCount = (expected: number) => expected + BASE_CALLS;

    it("renders the link with given URL", () => {
        const { container } = mountComponent();

        const element = container.querySelector(".s-btn-create_calculated_measure");
        expect(element).toHaveAttribute("href", "/#s=/gdc/workspaces/test|objectPage|none|metric");

        const { clickEvent, preventDefaultSpy } = createClickEvent(element);
        fireEvent(element, clickEvent);
        expect(preventDefaultSpy).toHaveBeenCalledTimes(getPreventedCallCount(0));
    });

    it("renders the link has workspaceRef with given URL", () => {
        const { container } = mountComponent(false);

        const element = container.querySelector(".s-btn-create_calculated_measure");
        expect(element).toHaveAttribute("href", "/#s=/gdc/workspaces/test|objectPage|none|metric");

        const { clickEvent, preventDefaultSpy } = createClickEvent(element);
        fireEvent(element, clickEvent);
        expect(preventDefaultSpy).toHaveBeenCalledTimes(getPreventedCallCount(0));
    });

    it("renders the link has projectRef with given URL", () => {
        const { container } = mountComponent(false);

        const element = container.querySelector(".s-btn-create_calculated_measure");
        expect(element).toHaveAttribute("href", "/#s=/gdc/workspaces/test|objectPage|none|metric");

        const { clickEvent, preventDefaultSpy } = createClickEvent(element);
        fireEvent(element, clickEvent);
        expect(preventDefaultSpy).toHaveBeenCalledTimes(getPreventedCallCount(0));
    });

    it("renders the link disabled", () => {
        const { container } = mountComponent(true);

        const element = container.querySelector(".s-btn-create_calculated_measure");
        expect(element).toHaveAttribute("href", "");
        expect(element).toHaveClass("disabled");

        const { clickEvent, preventDefaultSpy } = createClickEvent(element);
        fireEvent(element, clickEvent);
        expect(preventDefaultSpy).toHaveBeenCalledTimes(getPreventedCallCount(1));
    });
});
