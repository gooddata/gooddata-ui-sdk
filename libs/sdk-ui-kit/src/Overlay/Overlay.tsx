// (C) 2020-2023 GoodData Corporation
import React, { createRef } from "react";
import cx from "classnames";
import { Portal } from "react-portal";

import bindAll from "lodash/bindAll.js";
import pick from "lodash/pick.js";
import isEqual from "lodash/isEqual.js";
import isReactEqual from "react-fast-compare";
import findIndex from "lodash/findIndex.js";
import debounce from "lodash/debounce.js";
import noop from "lodash/noop.js";
import { v4 as uuid } from "uuid";

import { DEFAULT_ALIGN_POINTS, getOptimalAlignment, getOverlayStyles } from "../utils/overlay.js";
import { elementRegion, isFixedPosition } from "../utils/domUtilities.js";
import { ENUM_KEY_CODE } from "../typings/utilities.js";
import { IOverlayProps, IOverlayState } from "./typings.js";
import { Alignment, OverlayPositionType, SameAsTargetPosition } from "../typings/overlay.js";
import { OverlayContext } from "./OverlayContext.js";

const events = [
    { name: "click", handler: "closeOnOutsideClick", target: document },
    {
        name: "mousedown",
        handler: "onDocumentMouseDown",
        target: document,
        requiredProp: "closeOnOutsideClick",
    },
    { name: "goodstrap.scrolled", handler: "closeOnParentScroll" },
    { name: "goodstrap.drag", handler: "closeOnMouseDrag" },
    { name: "keydown", handler: "closeOnEscape" },
];

const eventProps = events.map((event) => event.handler);
const ALIGN_TIMEOUT_MS = 10;
const INIT_STATE_ALIGN = -500;

export const POSITION_SAME_AS_TARGET = "sameAsTarget";
const OVERLAY_CONTENT_CLASS = "gd-overlay-content";

function exceedsThreshold(firstNumber: number, secondNumber: number) {
    return Math.abs(firstNumber - secondNumber) > 2;
}

function alignExceedsThreshold(firstAlignment: Alignment, secondAlignment: Alignment) {
    return (
        exceedsThreshold(firstAlignment.top, secondAlignment.top) ||
        exceedsThreshold(firstAlignment.left, secondAlignment.left) ||
        exceedsThreshold(firstAlignment.right, secondAlignment.right)
    );
}

const stopPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.stopPropagation();
    const reactMajorVersion = parseInt(React.version?.split(".")[0], 10);
    // Propagate events to `document` for react 17
    // (We need to get them for other overlays to close and the events did not get there due to changes
    // introduced in https://reactjs.org/blog/2020/08/10/react-v17-rc.html#changes-to-event-delegation)
    if (reactMajorVersion >= 17) {
        const evt = new MouseEvent(e.nativeEvent.type, e.nativeEvent);
        Object.defineProperty(evt, "target", { value: e.nativeEvent.target, enumerable: true });
        document.dispatchEvent(evt);
    }
};

/**
 * @internal
 */
export class Overlay<T = HTMLElement> extends React.Component<IOverlayProps<T>, IOverlayState> {
    public static defaultProps: Partial<IOverlayProps<any>> = {
        alignPoints: DEFAULT_ALIGN_POINTS,
        alignTo: "body",
        children: false,
        className: "",
        containerClassName: "",
        positionType: "absolute",

        ignoreClicksOn: [],
        ignoreClicksOnByClass: [],

        shouldCloseOnClick: () => true,

        onClick: stopPropagation,
        onMouseOver: stopPropagation,
        onMouseUp: stopPropagation,
        onAlign: noop,
        onClose: noop,
    };

    private overlayRef = createRef<HTMLDivElement>();
    private containerRef = createRef<HTMLSpanElement>();
    private resizeHandler = debounce(() => this.align(), 100);
    private portalNode: HTMLDivElement | null = null;
    private isComponentMounted: boolean;
    private clickedInside: boolean;
    private id = uuid();
    private alignmentTimeoutId: number;
    static contextType = OverlayContext;
    declare context: React.ContextType<typeof OverlayContext>;

    constructor(props: IOverlayProps<T>) {
        super(props);

        this.state = {
            alignment: {
                align: props.alignPoints[0].align,
                left: INIT_STATE_ALIGN,
                top: INIT_STATE_ALIGN,
                right: 0,
            },
        };

        this.isComponentMounted = false;
        this.clickedInside = false;
        this.alignmentTimeoutId = 0;

        bindAll(
            this,
            events.map((event) => event.handler),
        );

        this.createPortalNode();
    }

    public UNSAFE_componentWillMount(): void {
        // reserve the zIndex via the context as soon as possible so that Overlays in the children get higher zIndex
        this.context?.addOverlay(this.id);
    }

    public componentDidMount(): void {
        this.isComponentMounted = true;
        afterOverlayOpened();

        window.addEventListener("resize", this.resizeHandler);

        this.addListeners(this.props);

        this.alignWithTimeout();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IOverlayProps<T>): void {
        if (!isEqual(pick(this.props, eventProps), pick(nextProps, eventProps))) {
            this.removeListeners(this.props);
            this.addListeners(nextProps);
        }
    }

    public shouldComponentUpdate(nextProps: IOverlayProps<T>, nextState: IOverlayState): boolean {
        const propsChanged = !isReactEqual(this.props, nextProps);
        const positionChanged = !isEqual(this.state.alignment, nextState.alignment);

        return propsChanged || positionChanged;
    }

    public componentDidUpdate(): void {
        this.alignWithTimeout();
    }

    public componentWillUnmount(): void {
        this.isComponentMounted = false;

        this.clearAlignmentTimeout();

        window.removeEventListener("resize", this.resizeHandler);

        this.removeListeners(this.props);

        this.removePortalNodeAfterAllTreeUnmount();

        this.context?.removeOverlay(this.id);

        afterOverlayClosed();
    }

    public render() {
        // Need stop propagation of events from Portal thats new behavior of react 16
        // https://github.com/facebook/react/issues/11387
        return (
            <span
                aria-label="portal-scroll-anchor"
                className="s-portal-scroll-anchor"
                ref={this.containerRef}
            >
                <Portal node={this.portalNode}>
                    {/* Do not prevent onScroll events - see ONE-4189 for details */}
                    <div
                        className={cx(this.props.containerClassName, OVERLAY_CONTENT_CLASS)}
                        onClick={this.props.onClick}
                        onMouseOver={this.props.onMouseOver}
                        onMouseUp={this.props.onMouseUp}
                    >
                        {this.renderMask()}
                        <div
                            ref={this.overlayRef}
                            style={this.getOverlayStyles()}
                            className={this.getOverlayClasses()}
                        >
                            {this.props.children}
                        </div>
                    </div>
                </Portal>
            </span>
        );
    }

    public align = (): void => {
        const { alignPoints, alignTo, positionType } = this.props;
        const overlay = this.overlayRef.current;

        if (!alignPoints || !overlay) {
            return;
        }

        const isSameAsTarget = this.isSameAsTargetPosition(positionType);
        const optimalAlign = getOptimalAlignment({
            targetRegion: elementRegion(alignTo, isSameAsTarget),
            selfRegion: elementRegion(overlay),
            alignPoints,
            ignoreScrollOffsets: isSameAsTarget,
        });

        if (alignExceedsThreshold(this.state.alignment, optimalAlign.alignment)) {
            this.setState(
                {
                    alignment: optimalAlign.alignment,
                },
                () => {
                    this.props.onAlign(optimalAlign.alignment);
                },
            );
        } else {
            this.props.onAlign(optimalAlign.alignment);
        }
    };

    private clearAlignmentTimeout = () => {
        if (this.alignmentTimeoutId) {
            window.clearTimeout(this.alignmentTimeoutId);
        }
    };

    private alignWithTimeout = () => {
        this.clearAlignmentTimeout();

        this.alignmentTimeoutId = window.setTimeout(() => {
            this.align();
        }, ALIGN_TIMEOUT_MS);
    };

    private onMaskClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!this.props.closeOnOutsideClick) {
            e.stopPropagation();
        }
    };

    protected getZIndex(): number | undefined {
        return this.context ? this.context.getZIndex(this.id) : this.props.zIndex;
    }

    protected getOverlayStyles = (): React.CSSProperties => {
        const { alignTo, positionType } = this.props;
        const { alignment } = this.state;

        const position = this.isSameAsTargetPosition(positionType)
            ? isFixedPosition(alignTo)
                ? "fixed"
                : "absolute"
            : positionType;

        return {
            position,
            left: alignment.left,
            top: alignment.top,
            zIndex: this.getZIndex(),
            visibility: this.isAligned() ? undefined : "hidden",
        };
    };

    private getOverlayClasses = (): string => {
        return cx(this.props.className, this.getAlignClasses(), {
            "overlay-wrapper": true,
        });
    };

    /**
     * Add CSS classes to overlay wrapper, so they can be used
     * for position of arrows and stuff
     */
    private getAlignClasses = (): string => {
        const align = this.state.alignment.align.split(" ");

        return `target-${align[0]} self-${align[1]}`;
    };

    private createPortalNode(): void {
        this.portalNode = document.createElement("div");
        document.body.appendChild(this.portalNode);
    }

    private removePortalNodeAfterAllTreeUnmount(): void {
        setTimeout(() => {
            if (this.portalNode && document.body.contains(this.portalNode)) {
                document.body.removeChild(this.portalNode);
            }
            this.portalNode = null;
        });
    }

    private isSameAsTargetPosition = (
        positionType: OverlayPositionType,
    ): positionType is SameAsTargetPosition => {
        return positionType === POSITION_SAME_AS_TARGET;
    };

    private isEventOnParent = (event: any) => {
        const node = this.containerRef.current;
        const eventNode = event.detail?.node || event.target;
        return eventNode.contains(node);
    };

    private shouldCloseOnClick = (e: Event) => {
        if (!this.isComponentMounted) {
            return false;
        }

        if (!this.isAligned()) {
            return false;
        }

        // an ignored node has been clicked, always keep the overlay open
        if (this.hasClickedOnIgnoredNode(e)) {
            return false;
        }

        // non-ignored node clicked, give shouldCloseOnClick the chance
        // to override closing the dialog
        return this.props.shouldCloseOnClick(e);
    };

    private hasClickedOnIgnoredNode = (e: any) => {
        if (e.defaultPrevented) {
            // Ignore event if it should be prevented (e.q. by click in child component)
            return true;
        }

        const clickedElement = e.target;

        if (this.isElementInChildOverlay(clickedElement) || this.clickedInside) {
            return true;
        }

        const ignoredRefElements = [this.overlayRef.current, ...this.props.ignoreClicksOn];
        const clickInsideIgnoredRefElement = ignoredRefElements.some((ref: any) => {
            return ref?.contains(clickedElement);
        });
        if (clickInsideIgnoredRefElement) {
            return true;
        }

        return this.props.ignoreClicksOnByClass.some((selector) => clickedElement.closest(selector));
    };

    private isAligned = () => {
        return this.state.alignment.left !== INIT_STATE_ALIGN && this.state.alignment.top != INIT_STATE_ALIGN;
    };

    // makes assumption that overlays later in the DOM are child overlays
    private isElementInChildOverlay = (element: HTMLElement) => {
        const overlays = Array.from(document.querySelectorAll(".overlay-wrapper"));
        const thisOverlayIndex = findIndex(overlays, (overlay) => overlay === this.overlayRef.current);

        return overlays.slice(thisOverlayIndex + 1).some((overlay) => overlay.contains(element));
    };

    public onDocumentMouseDown(e: React.MouseEvent): void {
        this.clickedInside = (this.overlayRef.current as any).contains(e.target);
        if (this.clickedInside) {
            e.stopPropagation();
        }
    }

    public closeOnParentScroll(e: React.MouseEvent): void {
        if (!this.isComponentMounted) {
            return;
        }

        if (this.isEventOnParent(e)) {
            this.props.onClose();
        }
    }

    public closeOnMouseDrag = (): void => {
        if (!this.isComponentMounted) {
            return;
        }

        this.props.onClose();
    };

    public closeOnOutsideClick(e: Event): void {
        if (this.shouldCloseOnClick(e)) {
            this.props.onClose();
        }
    }

    public closeOnEscape(e: React.KeyboardEvent): void {
        if (
            this.isComponentMounted &&
            this.props.closeOnEscape &&
            e.keyCode === ENUM_KEY_CODE.KEY_CODE_ESCAPE
        ) {
            this.props.onClose();
        }
    }

    private updateListeners = (method: "add" | "remove", props: IOverlayProps<T>) => {
        type PropKey = keyof IOverlayProps<T>;
        events.forEach((event) => {
            if (props[event.handler as PropKey] || props[event.requiredProp as PropKey]) {
                const handler = (this as Record<string, any>)[event.handler];
                if (handler) {
                    (event.target || window)[`${method}EventListener`](event.name, handler);
                }
            }
        });
    };

    private addListeners = (props: IOverlayProps<T>) => {
        this.updateListeners("add", props);
    };

    private removeListeners = (props: IOverlayProps<T>) => {
        this.updateListeners("remove", props);
    };

    private renderMask = (): false | JSX.Element => {
        const styles = {
            zIndex: this.context ? this.context.getZIndex(this.id) : null,
        };
        return this.props.isModal ? (
            <div
                className="modalityPlugin-mask modalityPlugin-mask-visible"
                onClick={this.onMaskClick}
                style={styles}
            />
        ) : (
            false
        );
    };
}

const overlayState = {
    opened: 0,
    body: {},
    html: {},
};
function afterOverlayOpened() {
    if (overlayState.opened === 0) {
        const styles = getOverlayStyles();
        overlayState.html = applyStyles(document.documentElement, styles.html);
        overlayState.body = applyStyles(document.body, styles.body);
    }
    overlayState.opened++;
}

function afterOverlayClosed() {
    overlayState.opened--;
    if (overlayState.opened === 0) {
        applyStyles(document.documentElement, overlayState.html);
        applyStyles(document.body, overlayState.body);
    }
}

function applyStyles(el: HTMLElement, newStyles: Record<string, any>) {
    return Object.keys(newStyles).reduce((prev, key) => {
        const style = el.style as Record<string, any>;
        const oldValue = style[key];
        style[key] = newStyles[key];
        return { ...prev, [key]: oldValue };
    }, {});
}
