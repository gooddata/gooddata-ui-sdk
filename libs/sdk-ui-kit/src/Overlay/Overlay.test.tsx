// (C) 2007-2026 GoodData Corporation

import { type RefObject, createRef, forwardRef, useState } from "react";

import { act, render, screen } from "@testing-library/react";
import { flushSync } from "react-dom";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerFloatingAnchor } from "../@ui/hooks/useCloseOnOutsideClick.js";
import { type OverlayPositionType } from "../typings/overlay.js";

import { Overlay } from "./Overlay.js";
import { OverlayAlignOnParentScrollProvider } from "./OverlayAlignOnParentScroll.js";
import { OverlayControllerProvider, useContainingOverlayZIndex } from "./OverlayContext.js";
import { OverlayController } from "./OverlayController.js";

/**
 * @internal
 */

interface IFixedComponentProps {
    className?: string;
    height?: number;
    left?: number;
    position?: string;
    top?: number;
    width?: number;
}

function FixedComponent({
    className = "",
    height = 0,
    left = 0,
    position = "static",
    top = 0,
    width = 0,
}: IFixedComponentProps) {
    const getStyle = (): any => {
        return {
            height,
            left,
            position,
            top,
            width,
        };
    };

    return <div className={className} style={getStyle()} />;
}

const ComposedOverlay = forwardRef<any, any>(function ComposedOverlay(props: any, ref) {
    return (
        <div>
            <FixedComponent {...props.fixed} />
            <Overlay {...props.overlay} ref={ref}>
                <FixedComponent {...props.content} />
            </Overlay>
        </div>
    );
});

function createEvent(options = {}) {
    return {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        ...options,
    };
}

function SelfRemovingButton() {
    const [isShown, setIsShown] = useState(true);

    return isShown ? (
        <button type="button" onClick={() => flushSync(() => setIsShown(false))}>
            Back
        </button>
    ) : (
        <span>Replaced</span>
    );
}

// happy-dom rebuilds composedPath() from the live DOM; browsers keep the path from dispatch start
function pinComposedPath(e: Event) {
    const path = e.composedPath();
    Object.defineProperty(e, "composedPath", { value: () => path });
}

function clickTargetThatRemovesItself(container: HTMLElement) {
    const target = document.createElement("button");
    container.appendChild(target);
    container.addEventListener("click", () => target.remove(), { once: true });
    target.click();
    return target;
}

function ContainingOverlayZIndexProbe({ testId }: { testId: string }) {
    return <span data-testid={testId}>{String(useContainingOverlayZIndex())}</span>;
}

describe("Overlay", () => {
    let div: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        div = document.createElement("div");
        div.className = "testContent";

        document.body.appendChild(div);
    });

    afterEach(() => {
        if (root) {
            root.unmount();
        }
        document.body.innerHTML = "";
    });

    function renderOverlaySetup(where: HTMLDivElement, props = {}): RefObject<unknown> {
        const ref = createRef();

        root = createRoot(where);
        flushSync(() => {
            root.render(<ComposedOverlay {...props} ref={ref} />);
        });

        // Add the container to the document so DOM queries work
        if (!document.body.contains(where)) {
            document.body.appendChild(where);
        }

        return ref;
    }

    function renderOverlayComponent(props = {}) {
        const options = { className: "foo-bar", ...props };
        return render(<Overlay {...options}>Overlay</Overlay>);
    }

    it("should render overlay with custom className", () => {
        renderOverlayComponent();
        expect(screen.getByText("Overlay")).toBeInTheDocument();
        expect(document.querySelector(".foo-bar")).toBeInTheDocument();
    });

    it("should render overlay with custom containerClassName", () => {
        const containerClassName = "custom-container-className";
        renderOverlayComponent({ containerClassName });
        expect(document.querySelector(`.${containerClassName}`)).toBeInTheDocument();
    });

    it("should render overlay with custom zIndex", () => {
        renderOverlayComponent({ zIndex: 5001 });
        expect(screen.getByText("Overlay")).toHaveStyle({ zIndex: 5001 });
    });

    describe("containing overlay z-index", () => {
        it("should provide no z-index to components rendered outside any overlay", () => {
            render(<ContainingOverlayZIndexProbe testId="outside" />);

            expect(screen.getByTestId("outside")).toHaveTextContent("undefined");
        });

        it("should provide its own z-index to its children", () => {
            render(
                <Overlay zIndex={5001}>
                    <ContainingOverlayZIndexProbe testId="inside" />
                </Overlay>,
            );

            expect(screen.getByTestId("inside")).toHaveTextContent("5001");
        });

        it("should provide the default overlay z-index without a controller or a z-index prop", () => {
            render(
                <Overlay>
                    <ContainingOverlayZIndexProbe testId="default" />
                </Overlay>,
            );

            expect(screen.getByTestId("default")).toHaveTextContent("5001");
        });

        it("should provide the z-index assigned by the overlay controller to its children", () => {
            const controller = OverlayController.getInstance(7000);
            render(
                <OverlayControllerProvider overlayController={controller}>
                    <Overlay>
                        <ContainingOverlayZIndexProbe testId="outer" />
                        <Overlay>
                            <ContainingOverlayZIndexProbe testId="nested" />
                        </Overlay>
                    </Overlay>
                </OverlayControllerProvider>,
            );

            const outer = Number(screen.getByTestId("outer").textContent);
            const nested = Number(screen.getByTestId("nested").textContent);
            const outerWrapper = screen.getByTestId("outer").parentElement;

            expect(outer).toBeGreaterThan(7000);
            expect(outerWrapper).toHaveStyle({ zIndex: outer });
            expect(nested).toBeGreaterThan(outer);
        });
    });

    describe("Align to fixed node", () => {
        describe("closeOnOutsideClick", () => {
            function renderClickedElement(className?: string) {
                const clickedElement = document.createElement("div");
                document.body.appendChild(clickedElement);

                if (className) {
                    clickedElement.className = className;
                }

                clickedElement.remove = () => {
                    document.body.removeChild(clickedElement);
                };

                return clickedElement;
            }

            it("should call onClose method on body click", async () => {
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: vi.fn(),
                    },
                };

                const ref = renderOverlaySetup(div, props);
                const overlay: any = ref.current;

                // Wait for the align to complete and state to update
                await act(async () => {
                    overlay.align();
                    // Wait for setState to complete
                    await new Promise((resolve) => setTimeout(resolve, 20));
                });

                overlay.closeOnOutsideClick(
                    createEvent({
                        target: document.body,
                    }),
                );

                expect(props.overlay.onClose).toHaveBeenCalledTimes(1);
            });

            it("should not call onClose when clicking on ignored element by ref", () => {
                const clickedElement = renderClickedElement();
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        ignoreClicksOn: [clickedElement],
                        onClose: vi.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;

                overlay.closeOnOutsideClick(
                    createEvent({
                        target: clickedElement,
                    }),
                );

                clickedElement.remove();

                expect(props.overlay.onClose).not.toHaveBeenCalled();
            });

            it("should not call onClose when clicking on ignored element by class", () => {
                const clickedElement = renderClickedElement("ignored-element");
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        ignoreClicksOnByClass: [".ignored-element"],
                        onClose: vi.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;

                overlay.closeOnOutsideClick(
                    createEvent({
                        target: clickedElement,
                    }),
                );

                clickedElement.remove();

                expect(props.overlay.onClose).not.toHaveBeenCalled();
            });

            it("should call shouldCloseOnClick when clicked element is not ignored element", async () => {
                const clickedElement = renderClickedElement();
                const shouldCloseOnClick = vi.fn(() => false);
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: vi.fn(),
                        shouldCloseOnClick,
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;

                // Wait for the align to complete and state to update
                await act(async () => {
                    overlay.align();
                    await new Promise((resolve) => setTimeout(resolve, 20));
                });

                const event = createEvent({
                    target: clickedElement,
                });

                overlay.closeOnOutsideClick(event);

                clickedElement.remove();

                expect(props.overlay.onClose).not.toHaveBeenCalled();
                expect(shouldCloseOnClick).toHaveBeenCalledTimes(1);
                expect(shouldCloseOnClick).toHaveBeenCalledWith(event);
            });

            it("should add overlay element to the list of ignored elements", () => {
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: vi.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                const target = overlay.overlayRef.current;

                overlay.closeOnOutsideClick(createEvent({ target }));

                expect(props.overlay.onClose).not.toHaveBeenCalled();
            });

            it('should call onClose when clicking on a "parent" overlay', async () => {
                const clickedElement = renderClickedElement("overlay-wrapper");
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: vi.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;

                // Wait for the align to complete and state to update
                await act(async () => {
                    overlay.align();
                    await new Promise((resolve) => setTimeout(resolve, 20));
                });

                overlay.closeOnOutsideClick(
                    createEvent({
                        target: clickedElement,
                    }),
                );

                clickedElement.remove();

                expect(props.overlay.onClose).toHaveBeenCalledTimes(1);
            });

            it('should not call onClose when clicking on a "parent" overlay when overlay is not aligned', () => {
                const clickedElement = renderClickedElement("overlay-wrapper");
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: vi.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                overlay.closeOnOutsideClick(
                    createEvent({
                        target: clickedElement,
                    }),
                );

                clickedElement.remove();

                expect(props.overlay.onClose).toHaveBeenCalledTimes(0);
            });

            it("should not call onClose when pressing inside a nested floating panel anchored within the overlay", async () => {
                const props = {
                    overlay: { closeOnOutsideClick: true, onClose: vi.fn() },
                    content: { className: "overlay-inner-content" },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                await act(async () => {
                    overlay.align();
                    await new Promise((resolve) => setTimeout(resolve, 20));
                });

                // A new-generation floating panel (e.g. UiDropdown menu) portals to <body>
                // but its anchor (the trigger) lives inside our overlay content.
                const anchorInsideOverlay = document.querySelector(".overlay-inner-content")!;
                const panel = document.createElement("div");
                panel.setAttribute("data-gd-floating-element", "true");
                const menuItem = document.createElement("div");
                panel.appendChild(menuItem);
                document.body.appendChild(panel);
                registerFloatingAnchor(panel, anchorInsideOverlay);

                overlay.onDocumentMouseDown(createEvent({ target: menuItem }));
                overlay.closeOnOutsideClick(createEvent({ target: menuItem }));

                panel.remove();

                expect(props.overlay.onClose).not.toHaveBeenCalled();
            });

            it("should not call onClose when pressing inside a floating panel anchored in a child overlay", async () => {
                const props = {
                    overlay: { closeOnOutsideClick: true, onClose: vi.fn() },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                await act(async () => {
                    overlay.align();
                    await new Promise((resolve) => setTimeout(resolve, 20));
                });

                // A child overlay (later .overlay-wrapper in the DOM) portals to <body>, outside
                // our subtree; a floating panel anchors inside it (e.g. a UiDropdown opened from
                // a legacy dropdown opened from us) and portals to <body> as well.
                const childOverlay = renderClickedElement("overlay-wrapper");
                const anchorInChildOverlay = document.createElement("div");
                childOverlay.appendChild(anchorInChildOverlay);
                const panel = document.createElement("div");
                panel.setAttribute("data-gd-floating-element", "true");
                const menuItem = document.createElement("div");
                panel.appendChild(menuItem);
                document.body.appendChild(panel);
                registerFloatingAnchor(panel, anchorInChildOverlay);

                overlay.onDocumentMouseDown(createEvent({ target: menuItem }));
                overlay.closeOnOutsideClick(createEvent({ target: menuItem }));

                panel.remove();
                childOverlay.remove();

                expect(props.overlay.onClose).not.toHaveBeenCalled();
            });

            it("should call onClose when pressing inside an unrelated floating panel anchored elsewhere", async () => {
                const props = {
                    overlay: { closeOnOutsideClick: true, onClose: vi.fn() },
                    content: { className: "overlay-inner-content" },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                await act(async () => {
                    overlay.align();
                    await new Promise((resolve) => setTimeout(resolve, 20));
                });

                // Same marker, but the panel is anchored outside our overlay — a genuine
                // outside click that should still close us.
                const anchorOutsideOverlay = document.createElement("div");
                document.body.appendChild(anchorOutsideOverlay);
                const panel = document.createElement("div");
                panel.setAttribute("data-gd-floating-element", "true");
                const menuItem = document.createElement("div");
                panel.appendChild(menuItem);
                document.body.appendChild(panel);
                registerFloatingAnchor(panel, anchorOutsideOverlay);

                overlay.onDocumentMouseDown(createEvent({ target: menuItem }));
                overlay.closeOnOutsideClick(createEvent({ target: menuItem }));

                panel.remove();
                anchorOutsideOverlay.remove();

                expect(props.overlay.onClose).toHaveBeenCalledTimes(1);
            });

            describe("when the click removes its own target before it reaches the document", () => {
                beforeEach(() => {
                    window.addEventListener("click", pinComposedPath, true);
                });

                afterEach(() => {
                    window.removeEventListener("click", pinComposedPath, true);
                });

                async function alignOverlay(ref: RefObject<Overlay | null>) {
                    await act(async () => {
                        ref.current?.align();
                        await new Promise((resolve) => setTimeout(resolve, 20));
                    });
                }

                it("should not call onClose when the target was inside the overlay", async () => {
                    const onClose = vi.fn<() => void>();
                    const ref = createRef<Overlay>();
                    // A no-op onClick lets the click bubble to document, as Dropdown's enableEventPropagation does
                    render(
                        <Overlay ref={ref} closeOnOutsideClick onClose={onClose} onClick={() => {}}>
                            <SelfRemovingButton />
                        </Overlay>,
                    );
                    await alignOverlay(ref);

                    const button = screen.getByRole("button", { name: "Back" });
                    act(() => {
                        button.click();
                    });

                    expect(button.isConnected).toBe(false);
                    expect(onClose).not.toHaveBeenCalled();

                    act(() => {
                        document.body.click();
                    });

                    expect(onClose).toHaveBeenCalledTimes(1);
                });

                it("should not call onClose when the target was inside a child overlay", async () => {
                    const onClose = vi.fn<() => void>();
                    const ref = createRef<Overlay>();
                    render(<Overlay ref={ref} closeOnOutsideClick onClose={onClose} />);
                    await alignOverlay(ref);
                    const childOverlay = renderClickedElement("overlay-wrapper");

                    const target = clickTargetThatRemovesItself(childOverlay);

                    expect(target.isConnected).toBe(false);
                    expect(onClose).not.toHaveBeenCalled();

                    childOverlay.remove();
                    document.body.click();

                    expect(onClose).toHaveBeenCalledTimes(1);
                });

                it("should not call onClose when the target was inside an element ignored by class", async () => {
                    const onClose = vi.fn<() => void>();
                    const ref = createRef<Overlay>();
                    render(
                        <Overlay
                            ref={ref}
                            closeOnOutsideClick
                            ignoreClicksOnByClass={[".ignored-element"]}
                            onClose={onClose}
                        />,
                    );
                    await alignOverlay(ref);
                    const ignoredElement = renderClickedElement("ignored-element");

                    const target = clickTargetThatRemovesItself(ignoredElement);

                    expect(target.isConnected).toBe(false);
                    expect(onClose).not.toHaveBeenCalled();

                    ignoredElement.remove();
                    document.body.click();

                    expect(onClose).toHaveBeenCalledTimes(1);
                });

                it("should call onClose when the target was outside the overlay", async () => {
                    const onClose = vi.fn<() => void>();
                    const ref = createRef<Overlay>();
                    render(<Overlay ref={ref} closeOnOutsideClick onClose={onClose} />);
                    await alignOverlay(ref);
                    const outsideElement = renderClickedElement();

                    const target = clickTargetThatRemovesItself(outsideElement);
                    outsideElement.remove();

                    expect(target.isConnected).toBe(false);
                    expect(onClose).toHaveBeenCalledTimes(1);
                });
            });

            it("should call onClose when ESC key pressed", () => {
                const props = {
                    closeOnEscape: true,
                    onClose: vi.fn(),
                };

                renderOverlayComponent(props);
                const event = new KeyboardEvent("keydown", {
                    key: "Escape",
                });
                window.dispatchEvent(
                    Object.defineProperty(event, "keyCode", {
                        get: () => 27,
                    }),
                );

                expect(props.onClose).toHaveBeenCalledTimes(1);
            });
        });

        describe("call handler on align", () => {
            it("should call onAlign method on align", async () => {
                const onAlignHandler = vi.fn();

                const overlay: any = renderOverlaySetup(div, {
                    overlay: {
                        onAlign: onAlignHandler,
                    },
                }).current;

                // Wait for the align to complete
                await act(async () => {
                    overlay.align();
                    await new Promise((resolve) => setTimeout(resolve, 20));
                });

                expect(onAlignHandler).toHaveBeenCalled();
            });
        });
    });

    describe("Portal DOM node", () => {
        it("should create node when Overlay constructed", () => {
            renderOverlayComponent();
            expect(screen.getByTestId("portal-scroll-anchor")).toBeInTheDocument();
        });

        it("should remove node asynchronously after component unmount", () => {
            const { unmount } = renderOverlayComponent();
            unmount();
            expect(screen.queryAllByTestId("portal-scroll-anchor")).toHaveLength(0);
        });
    });

    describe("align on parent scroll", () => {
        const waitForAlign = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)));
        // the initial alignment re-renders the overlay, which schedules one more alignment
        const waitForInitialAlign = async () => {
            await waitForAlign();
            await waitForAlign();
        };

        const renderScrollableSetup = (
            overlayProps: {
                alignOnParentScroll?: boolean;
                closeOnAnchorHidden?: boolean;
                onClose?: () => void;
            } = {},
            isProviderEnabled?: boolean,
            isProviderClosingOnAnchorHidden?: boolean,
        ) => {
            const onAlign = vi.fn();
            function AnchoredOverlay() {
                return (
                    <div className="scroll-parent">
                        <button className="anchor" />
                        <Overlay alignTo=".anchor" onAlign={onAlign} {...overlayProps}>
                            <div className="scroll-inside-overlay" />
                        </Overlay>
                    </div>
                );
            }
            render(
                isProviderEnabled === undefined ? (
                    <AnchoredOverlay />
                ) : (
                    <OverlayAlignOnParentScrollProvider
                        enabled={isProviderEnabled}
                        closeOnAnchorHidden={isProviderClosingOnAnchorHidden}
                    >
                        <AnchoredOverlay />
                    </OverlayAlignOnParentScrollProvider>
                ),
            );
            return onAlign;
        };

        const scroll = (selector: string) =>
            act(() => {
                document.querySelector(selector)!.dispatchEvent(new Event("scroll"));
            });

        it("should not re-align on parent scroll by default", async () => {
            const onAlign = renderScrollableSetup();
            await waitForInitialAlign();
            onAlign.mockClear();

            await scroll(".scroll-parent");
            await waitForAlign();

            expect(onAlign).not.toHaveBeenCalled();
        });

        it("should re-align on parent scroll when enabled by provider", async () => {
            const onAlign = renderScrollableSetup({}, true);
            await waitForInitialAlign();
            onAlign.mockClear();

            await scroll(".scroll-parent");
            await waitForAlign();

            expect(onAlign).toHaveBeenCalled();
        });

        it("should re-align on parent scroll when enabled by prop", async () => {
            const onAlign = renderScrollableSetup({ alignOnParentScroll: true });
            await waitForInitialAlign();
            onAlign.mockClear();

            await scroll(".scroll-parent");
            await waitForAlign();

            expect(onAlign).toHaveBeenCalled();
        });

        it("should prefer the prop over the provider", async () => {
            const onAlign = renderScrollableSetup({ alignOnParentScroll: false }, true);
            await waitForInitialAlign();
            onAlign.mockClear();

            await scroll(".scroll-parent");
            await waitForAlign();

            expect(onAlign).not.toHaveBeenCalled();
        });

        it("should not re-align when an element that does not contain the anchor scrolls", async () => {
            const onAlign = renderScrollableSetup({}, true);
            await waitForInitialAlign();
            onAlign.mockClear();

            await scroll(".scroll-inside-overlay");
            await waitForAlign();

            expect(onAlign).not.toHaveBeenCalled();
        });

        describe("close on anchor hidden", () => {
            let observedElements: Element[];
            let notifyIntersection: (...isIntersecting: boolean[]) => void;

            beforeEach(() => {
                observedElements = [];
                vi.stubGlobal(
                    "IntersectionObserver",
                    class {
                        constructor(callback: IntersectionObserverCallback) {
                            notifyIntersection = (...isIntersecting) =>
                                act(() => {
                                    callback(
                                        isIntersecting.map(
                                            (value) =>
                                                ({ isIntersecting: value }) as IntersectionObserverEntry,
                                        ),
                                        this as unknown as IntersectionObserver,
                                    );
                                });
                        }
                        observe(element: Element) {
                            observedElements.push(element);
                        }
                        disconnect() {}
                    },
                );
            });

            afterEach(() => {
                vi.unstubAllGlobals();
            });

            it("should not observe the anchor by default", () => {
                renderScrollableSetup({ onClose: vi.fn() }, true);

                expect(observedElements).toEqual([]);
            });

            it("should call onClose once the visible anchor gets hidden when enabled by provider", () => {
                const onClose = vi.fn();
                renderScrollableSetup({ onClose }, true, true);

                expect(observedElements).toEqual([document.querySelector(".anchor")]);
                notifyIntersection(true);
                expect(onClose).not.toHaveBeenCalled();
                notifyIntersection(false);
                expect(onClose).toHaveBeenCalledTimes(1);
            });

            it("should call onClose once the visible anchor gets hidden when enabled by prop", () => {
                const onClose = vi.fn();
                renderScrollableSetup({ onClose, closeOnAnchorHidden: true });

                notifyIntersection(true);
                notifyIntersection(false);
                expect(onClose).toHaveBeenCalledTimes(1);
            });

            it("should call onClose when visible and hidden entries come in one callback", () => {
                const onClose = vi.fn();
                renderScrollableSetup({ onClose }, true, true);

                notifyIntersection(true, false);
                expect(onClose).toHaveBeenCalledTimes(1);
            });

            it("should not call onClose when the anchor was hidden already when opened", () => {
                const onClose = vi.fn();
                renderScrollableSetup({ onClose }, true, true);

                notifyIntersection(false);
                expect(onClose).not.toHaveBeenCalled();
            });

            it("should prefer the prop over the provider", () => {
                const onClose = vi.fn();
                renderScrollableSetup({ onClose, closeOnAnchorHidden: false }, true, true);

                expect(observedElements).toEqual([]);
            });
        });
    });

    describe("keep bottom on resize", () => {
        let overlayHeight: number;
        let viewportWidth: number;
        let notifyResize: (height: number) => void;

        beforeEach(() => {
            overlayHeight = 100;
            viewportWidth = 1000;
            vi.stubGlobal(
                "ResizeObserver",
                class {
                    constructor(callback: ResizeObserverCallback) {
                        notifyResize = (height) => {
                            overlayHeight = height;
                            callback(
                                [{ contentRect: { height } } as ResizeObserverEntry],
                                this as unknown as ResizeObserver,
                            );
                        };
                    }
                    observe() {}
                    disconnect() {}
                },
            );
            vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
                this: HTMLElement,
            ) {
                const isOverlay = this.classList.contains("overlay-wrapper");
                const isAnchor = this.classList.contains("anchor");
                const isBody = this === document.body;
                const height = isOverlay ? overlayHeight : isBody ? window.innerHeight : 0;
                const width = isOverlay ? 212 : isAnchor ? 16 : isBody ? viewportWidth : 0;
                const top = isAnchor ? 300 : -window.scrollY;
                const left = isAnchor ? 450 : 0;
                return { top, left, right: left + width, bottom: top + height, width, height } as DOMRect;
            });
        });

        afterEach(() => {
            vi.unstubAllGlobals();
            vi.restoreAllMocks();
        });

        const renderAlignedOverlay = async (align: string | string[], positionType?: OverlayPositionType) => {
            render(
                <div>
                    <button className="anchor" />
                    <Overlay
                        alignTo=".anchor"
                        alignPoints={[align].flat().map((point) => ({ align: point }))}
                        positionType={positionType}
                        resizeObserverThreshold={0.01}
                        keepBottomOnResize
                    >
                        <div />
                    </Overlay>
                </div>,
            );
            await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
            return document.querySelector<HTMLElement>(".overlay-wrapper")!;
        };

        it.each([
            ["below", "bl tl", "400px"],
            ["above", "tl bl", "300px"],
        ])(
            "should position the overlay %s the anchor by its bottom edge and keep it when shrinking",
            async (_position, align, bottom) => {
                const overlay = await renderAlignedOverlay(align);
                expect(overlay.style.top).toBe(bottom);
                expect(overlay.style.transform).toBe("translateY(-100%)");

                act(() => notifyResize(60));

                expect(overlay.style.top).toBe(bottom);
            },
        );

        it("should keep the overlay within the viewport only while it does not fit", async () => {
            const overlay = await renderAlignedOverlay("tl bl");

            act(() => notifyResize(400));
            expect(overlay.style.top).toBe("400px");

            act(() => notifyResize(100));
            expect(overlay.style.top).toBe("300px");
        });

        it("should keep a fixed overlay within the viewport when the page is scrolled", async () => {
            const setPageScroll = (value: number) => {
                for (const property of ["scrollY", "pageYOffset"]) {
                    Object.defineProperty(window, property, { value, configurable: true, writable: true });
                }
            };
            setPageScroll(1000);
            try {
                const overlay = await renderAlignedOverlay("tl bl", "fixed");

                act(() => notifyResize(400));

                expect(overlay.style.top).toBe(`${window.innerHeight}px`);
            } finally {
                setPageScroll(0);
            }
        });

        it("should align to the other side when the viewport gets narrower", async () => {
            const overlay = await renderAlignedOverlay(["tr tl", "tl tr"]);
            expect(overlay.style.left).toBe("466px");

            viewportWidth = 600;
            await act(async () => {
                window.dispatchEvent(new Event("resize"));
                await new Promise((resolve) => setTimeout(resolve, 150));
            });

            expect(overlay.style.left).toBe("238px");
        });
    });
});
