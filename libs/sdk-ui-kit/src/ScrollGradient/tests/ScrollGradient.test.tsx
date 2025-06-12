// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { ScrollGradient } from "../ScrollGradient.js";
import { IScrollGradientProps } from "../typings.js";
import { useRightInScrollable } from "../hooks/useRightInScrollable.js";
import { useScrollEvent } from "../hooks/useScrollEvent.js";
import { useGradientColor } from "../hooks/useGradientColor.js";
import { useContentHeight } from "../hooks/useContentHeight.js";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function renderScrollGradient(height: number, options: Partial<IScrollGradientProps>) {
    return render(
        <div style={{ width: 200, maxHeight: 200, display: "flex" }}>
            <ScrollGradient {...options}>
                <div style={{ width: "100%", height }}>Scroll Gradient</div>
            </ScrollGradient>
        </div>,
    );
}

function renderRightInScrollable(): [() => ReturnType<typeof useRightInScrollable>, () => void] {
    let data: ReturnType<typeof useRightInScrollable>;

    function HookComponent(): null {
        data = useRightInScrollable();
        return null;
    }

    const { unmount } = render(
        <div>
            <HookComponent />
        </div>,
    );

    return [() => data, () => unmount()];
}

function renderScrollEvent(
    content: HTMLElement,
    size: number,
): [() => ReturnType<typeof useScrollEvent>, () => void] {
    let data: ReturnType<typeof useScrollEvent>;

    function HookComponent(): null {
        data = useScrollEvent(content, size);
        return null;
    }

    const { unmount } = render(
        <div>
            <HookComponent />
        </div>,
    );

    return [() => data, () => unmount()];
}

function renderGradientColor(color: string): [() => ReturnType<typeof useGradientColor>, () => void] {
    let data: ReturnType<typeof useGradientColor>;

    function HookComponent(): null {
        data = useGradientColor(color);
        return null;
    }

    const { unmount } = render(
        <div>
            <HookComponent />
        </div>,
    );

    return [() => data, () => unmount()];
}

function renderContentHeight(element: HTMLElement): [() => ReturnType<typeof useContentHeight>, () => void] {
    let data: ReturnType<typeof useContentHeight>;

    function HookComponent(): null {
        data = useContentHeight(element);
        return null;
    }

    const { unmount } = render(
        <div>
            <HookComponent />
        </div>,
    );

    return [() => data, () => unmount()];
}

describe("ScrollGradient", () => {
    describe("rendering", () => {
        let onScroll: IScrollGradientProps["onScroll"];
        let spy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            onScroll = vi.fn();
            spy = vi.spyOn(window, "getComputedStyle");
            spy.mockReturnValue({ width: "185px" } as CSSStyleDeclaration);
        });

        it("render component", () => {
            renderScrollGradient(800, { onScroll });
            expect(screen.getByText("Scroll Gradient")).toBeInTheDocument();
            expect(document.querySelector(".gd-gradient-wrapper")).toBeInTheDocument();
        });

        it("propagate scroll handler", async () => {
            renderScrollGradient(800, { onScroll });
            expect(onScroll).not.toHaveBeenCalled();
            fireEvent.scroll(document.querySelector(".gd-gradient-content"), { target: { scrollY: 100 } });
            expect(onScroll).toHaveBeenCalled();
        });

        afterEach(() => {
            spy.mockRestore();
        });
    });

    describe("useRightInScrollable", () => {
        function mock(width: number, space: number) {
            const content = document.createElement("div");
            vi.spyOn(content, "offsetWidth", "get").mockReturnValue(width);

            const getComputedStyleMock = vi.spyOn(window, "getComputedStyle").mockReturnValue({
                width: `${width - space}px`,
            } as CSSStyleDeclaration);

            return {
                getComputedStyleMock,
                content,
            };
        }

        it("calculate right base on before width", () => {
            const width = 200;
            const space = 15;
            const { content, getComputedStyleMock } = mock(width, space);

            const [data, clear] = renderRightInScrollable();

            expect(data().right).toBe(0);
            expect(data().content).toBe(null);
            expect(getComputedStyleMock).not.toHaveBeenCalled();
            act(() => data().setContent(content));

            expect(data().right).toBe(space);
            expect(data().content).toBe(content);
            expect(getComputedStyleMock).toHaveBeenCalledWith(content, ":before");
            getComputedStyleMock.mockRestore();
            clear();
        });
    });

    describe("useScrollEvent", () => {
        function mock(height: number, contentHeight: number, scrollTop: number) {
            const content = document.createElement("div");
            vi.spyOn(content, "offsetHeight", "get").mockReturnValue(height);
            vi.spyOn(content, "scrollHeight", "get").mockReturnValue(contentHeight);
            const scrollTopSpy = vi.spyOn(content, "scrollTop", "get");
            scrollTopSpy.mockReturnValue(scrollTop);

            return {
                content,
                scrollTopSpy,
            };
        }

        function scroll(
            scrollTopSpy: ReturnType<typeof vi.spyOn>,
            onScrollHandler: (e: React.MouseEvent<HTMLDivElement>) => void,
            top: number,
        ) {
            scrollTopSpy.mockReturnValue(top);
            act(() => onScrollHandler({} as unknown as React.MouseEvent<HTMLDivElement>));
        }

        describe("calculate top, bottom opacity", () => {
            const height = 200;
            const contentHeight = 800;

            const Scenarios: Array<[number, number, number, number]> = [
                //size: 20
                [20, 0, 0, 1],
                [20, 1, 0.2, 1],
                [20, 5, 0.25, 1],
                [20, 10, 0.5, 1],
                [20, 15, 0.75, 1],
                [20, 20, 1, 1],
                [20, 580, 1, 1],
                [20, 585, 1, 0.75],
                [20, 590, 1, 0.5],
                [20, 595, 1, 0.25],
                [20, 599, 1, 0.2],
                [20, 600, 1, 0],
                //size: 80
                [80, 0, 0, 1],
                [80, 1, 0.2, 1],
                [80, 5, 0.2, 1],
                [80, 10, 0.2, 1],
                [80, 20, 0.25, 1],
                [80, 30, 0.375, 1],
                [80, 40, 0.5, 1],
                [80, 50, 0.625, 1],
                [80, 60, 0.75, 1],
                [80, 70, 0.875, 1],
                [80, 80, 1, 1],
            ];

            it.each(Scenarios)("by size and scroll top", (size, scrollTop, expectedTop, expectedBottom) => {
                const { content, scrollTopSpy } = mock(height, contentHeight, 0);

                const [data, clear] = renderScrollEvent(content, size);
                if (scrollTop > 0) {
                    scroll(scrollTopSpy, data().onScrollHandler, scrollTop);
                }
                expect(data().top).toBe(expectedTop);
                expect(data().bottom).toBe(expectedBottom);

                clear();
            });
        });
    });

    describe("useGradientColor", () => {
        it("create background for top and bottom", () => {
            const [data, clear] = renderGradientColor("#FFFFFF");

            expect(data().topBackground).toBe(`linear-gradient(#FFFFFF, rgba(255, 255, 255, 0.001))`);
            expect(data().bottomBackground).toBe(`linear-gradient(rgba(255, 255, 255, 0.001), #FFFFFF)`);
            clear();
        });
    });

    describe("useContentHeight", () => {
        let raf: ReturnType<typeof vi.spyOn>, handler: FrameRequestCallback;

        beforeEach(() => {
            raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation((h) => {
                handler = h;
                return 1;
            });
        });

        it("determine content height from element", () => {
            const el = document.createElement("div");
            const spy = vi.spyOn(el, "scrollHeight", "get");

            const [data, clear] = renderContentHeight(el);
            expect(data()).toBe(-1);

            act(() => {
                spy.mockReturnValue(0);
                handler(0);
            });
            expect(data()).toBe(0);

            act(() => {
                spy.mockReturnValue(1000);
                handler(0);
            });
            expect(data()).toBe(1000);
            clear();
        });

        afterEach(() => {
            raf.mockRestore();
        });
    });
});
