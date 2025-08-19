// (C) 2007-2025 GoodData Corporation
import React, { forwardRef, createRef } from "react";
// eslint-disable-next-line react/no-deprecated
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import { render, screen } from "@testing-library/react";
import { suppressConsole } from "@gooddata/util";

import { Overlay } from "../Overlay.js";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * @internal
 */

interface FixedComponentProps {
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
}: FixedComponentProps) {
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

const ComposedOverlay = forwardRef(function ComposedOverlay(props: any, ref) {
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

describe("Overlay", () => {
    let div: HTMLDivElement;

    beforeEach(() => {
        div = document.createElement("div");
        div.className = "testContent";

        document.body.appendChild(div);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    function renderOverlaySetup(where: HTMLDivElement, props = {}): React.RefObject<unknown> {
        const ref = createRef();

        suppressConsole(
            () => {
                // eslint-disable-next-line react/no-deprecated
                ReactDOM.render(<ComposedOverlay {...props} ref={ref} />, where);
            },
            "error",
            [
                {
                    type: "includes",
                    value: "ReactDOM.render", // TODO: Remove this in react 19 upgrade
                },
            ],
        );

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

            it("should call onClose method on body click", () => {
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: vi.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                overlay.align();
                overlay.closeOnOutsideClick(
                    createEvent({
                        target: document.body,
                    }),
                );

                suppressConsole(() => unmountComponentAtNode(div), "error", [
                    { type: "includes", value: "ReactDOM.render" },
                    { type: "includes", value: "unmountComponentAtNode" },
                ]);

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

                unmountComponentAtNode(div);
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

                unmountComponentAtNode(div);
                clickedElement.remove();

                expect(props.overlay.onClose).not.toHaveBeenCalled();
            });

            it("should call shouldCloseOnClick when clicked element is not ignored element", () => {
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
                overlay.align();
                const event = createEvent({
                    target: clickedElement,
                });

                overlay.closeOnOutsideClick(event);

                unmountComponentAtNode(div);
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

                unmountComponentAtNode(div);

                expect(props.overlay.onClose).not.toHaveBeenCalled();
            });

            it('should call onClose when clicking on a "parent" overlay', () => {
                const clickedElement = renderClickedElement("overlay-wrapper");
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: vi.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                overlay.align();
                overlay.closeOnOutsideClick(
                    createEvent({
                        target: clickedElement,
                    }),
                );

                unmountComponentAtNode(div);
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

                unmountComponentAtNode(div);
                clickedElement.remove();

                expect(props.overlay.onClose).toHaveBeenCalledTimes(0);
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
            it("should call onAlign method on align", () => {
                const onAlignHandler = vi.fn();

                const overlay: any = renderOverlaySetup(div, {
                    overlay: {
                        onAlign: onAlignHandler,
                    },
                }).current;
                overlay.align();

                unmountComponentAtNode(div);

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
});
