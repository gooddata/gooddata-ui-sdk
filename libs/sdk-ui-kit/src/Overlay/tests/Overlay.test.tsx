// (C) 2007-2022 GoodData Corporation
import React, { Component, forwardRef, createRef } from "react";
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import { render, screen } from "@testing-library/react";

import { Overlay } from "../Overlay";

/**
 * @internal
 */

interface FixedComponentProps {
    className: string;
    height: number;
    left: number;
    position: string;
    top: number;
    width: number;
}

class FixedComponent extends Component<FixedComponentProps> {
    static defaultProps = {
        className: "",
        height: 0,
        left: 0,
        position: "static",
        top: 0,
        width: 0,
    };

    getStyle(): any {
        return {
            height: this.props.height,
            left: this.props.left,
            position: this.props.position,
            top: this.props.top,
            width: this.props.width,
        };
    }

    render() {
        return <div className={this.props.className} style={this.getStyle()} />;
    }
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
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
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

        ReactDOM.render(<ComposedOverlay {...props} ref={ref} />, where);

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
                        onClose: jest.fn(),
                    },
                };

                const overlay: any = renderOverlaySetup(div, props).current;
                overlay.align();
                overlay.closeOnOutsideClick(
                    createEvent({
                        target: document.body,
                    }),
                );

                unmountComponentAtNode(div);

                expect(props.overlay.onClose).toHaveBeenCalledTimes(1);
            });

            it("should not call onClose when clicking on ignored element by ref", () => {
                const clickedElement = renderClickedElement();
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        ignoreClicksOn: [clickedElement],
                        onClose: jest.fn(),
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
                        onClose: jest.fn(),
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
                const shouldCloseOnClick = jest.fn(() => false);
                const props = {
                    overlay: {
                        closeOnOutsideClick: true,
                        onClose: jest.fn(),
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
                        onClose: jest.fn(),
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
                        onClose: jest.fn(),
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
                        onClose: jest.fn(),
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
                    onClose: jest.fn(),
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
                const onAlignHandler = jest.fn();

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
            expect(screen.getByLabelText("portal-scroll-anchor")).toBeInTheDocument();
        });

        it("should remove node asynchronously after component unmount", () => {
            const { unmount } = renderOverlayComponent();
            unmount();
            expect(screen.queryByLabelText("portal-scroll-anchor")).not.toBeInTheDocument();
        });
    });
});
