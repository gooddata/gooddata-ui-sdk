// (C) 2020-2025 GoodData Corporation

import {
    CSSProperties,
    Component,
    ContextType,
    ReactElement,
    MouseEvent as ReactMouseEvent,
    createRef,
} from "react";

import cx from "classnames";
import { bindAll, debounce, isEqual, pick } from "lodash-es";
import isReactEqual from "react-fast-compare";
import { Portal } from "react-portal";
import { v4 as uuid } from "uuid";

import { OverlayContext } from "./OverlayContext.js";
import { IOverlayProps, IOverlayState } from "./typings.js";
import { Alignment, OverlayPositionType, SameAsTargetPosition } from "../typings/overlay.js";
import { ENUM_KEY_CODE } from "../typings/utilities.js";
import { elementRegion, isFixedPosition } from "../utils/domUtilities.js";
import { DEFAULT_ALIGN_POINTS, getOptimalAlignment, getOverlayStyles } from "../utils/overlay.js";

const events = [
    {
        name: "click",
        handler: "closeOnOutsideClick",
        target: typeof document === "undefined" ? null : document,
    },
    {
        name: "mousedown",
        handler: "onDocumentMouseDown",
        target: typeof document === "undefined" ? null : document,
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
const VISIBLE_PART_TOLERANCE = 0.01;

function exceedsThreshold(firstNumber: number | undefined, secondNumber: number | undefined) {
    return (
        (firstNumber === undefined && secondNumber !== undefined) ||
        (firstNumber !== undefined && secondNumber === undefined) ||
        Math.abs((firstNumber ?? 0) - (secondNumber ?? 0)) > 2
    );
}

function alignExceedsThreshold(firstAlignment: Alignment, secondAlignment: Alignment) {
    return (
        exceedsThreshold(firstAlignment.top, secondAlignment.top) ||
        exceedsThreshold(firstAlignment.left, secondAlignment.left) ||
        exceedsThreshold(firstAlignment.right, secondAlignment.right) ||
        exceedsThreshold(firstAlignment.width, secondAlignment.width) ||
        exceedsThreshold(firstAlignment.height, secondAlignment.height)
    );
}

/**
 * Stops React synthetic event propagation but re-dispatches native events
 * to document and documentElement so that:
 * - Other Overlays can detect outside clicks and close themselves
 * - Libraries listening on document.documentElement (like fixed-data-table-2's
 *   DOMMouseMoveTracker for scrollbar drag release) receive the events
 */
const stopPropagation = (e: ReactMouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.stopPropagation();
    const evt = new MouseEvent(e.nativeEvent.type, e.nativeEvent);
    Object.defineProperty(evt, "target", { value: e.nativeEvent.target, enumerable: true });
    document.dispatchEvent(evt);
    document.documentElement.dispatchEvent(evt);
};

/**
 * @internal
 */
export class Overlay<T = HTMLElement> extends Component<IOverlayProps<T>, IOverlayState> {
    public static defaultProps: Partial<IOverlayProps<any>> = {
        alignPoints: DEFAULT_ALIGN_POINTS,
        alignTo: "body",
        children: false,
        className: "",
        containerClassName: "",
        positionType: "absolute",

        resizeObserverThreshold: 1,

        ignoreClicksOn: [],
        ignoreClicksOnByClass: [],

        ensureVisibility: false,

        shouldCloseOnClick: () => true,

        onClick: stopPropagation,
        onMouseOver: stopPropagation,
        onMouseUp: stopPropagation,
        onAlign: () => {},
        onClose: () => {},
    };

    private readonly id: string;
    private overlayRef = createRef<HTMLDivElement>();
    private containerRef = createRef<HTMLSpanElement>();
    private resizeHandler = debounce(() => {
        this.align();
    }, 100);
    private portalNode: HTMLDivElement | null = null;
    private isComponentMounted: boolean;
    private clickedInside: boolean;
    private alignmentTimeoutId: number;
    static override contextType = OverlayContext;
    declare context: ContextType<typeof OverlayContext>;
    private observer: ResizeObserver | undefined;

    constructor(props: IOverlayProps<T>) {
        super(props);

        this.state = {
            alignment: {
                align: props.alignPoints?.[0]?.align ?? "cc cc",
                left: INIT_STATE_ALIGN,
                top: INIT_STATE_ALIGN,
                right: 0,
                width: 0,
                height: 0,
            },
            visiblePart: 0,
            observedHeight: 0,
        };

        this.observer = this.createResizeObserver();

        this.isComponentMounted = false;
        this.clickedInside = false;
        this.alignmentTimeoutId = 0;
        this.id = props.id ?? uuid();

        bindAll(
            this,
            events.map((event) => event.handler),
        );

        this.createPortalNode();
    }

    public override UNSAFE_componentWillMount(): void {
        // reserve the zIndex via the context as soon as possible so that Overlays in the children get higher zIndex
        this.context?.addOverlay(this.id);
    }

    public override componentDidMount(): void {
        this.isComponentMounted = true;
        afterOverlayOpened();

        window.addEventListener("resize", this.resizeHandler);

        if (this.overlayRef.current) {
            this.observer?.observe(this.overlayRef.current);
        }

        this.addListeners(this.props);

        this.alignWithTimeout();
    }

    public override UNSAFE_componentWillReceiveProps(nextProps: IOverlayProps<T>): void {
        if (!isEqual(pick(this.props, eventProps), pick(nextProps, eventProps))) {
            this.removeListeners(this.props);
            this.addListeners(nextProps);
        }
    }

    public override shouldComponentUpdate(nextProps: IOverlayProps<T>, nextState: IOverlayState): boolean {
        const propsChanged = !isReactEqual(this.props, nextProps);
        const positionChanged = !isEqual(this.state.alignment, nextState.alignment);
        const visibilityChanged =
            Math.abs(this.state.visiblePart - nextState.visiblePart) > VISIBLE_PART_TOLERANCE;

        return propsChanged || positionChanged || visibilityChanged;
    }

    public override componentDidUpdate(): void {
        this.alignWithTimeout();
    }

    public override componentWillUnmount(): void {
        this.isComponentMounted = false;

        this.clearAlignmentTimeout();

        window.removeEventListener("resize", this.resizeHandler);

        this.observer?.disconnect();

        this.removeListeners(this.props);

        this.removePortalNodeAfterAllTreeUnmount();

        this.context?.removeOverlay(this.id);

        afterOverlayClosed();
    }

    public override render() {
        // Need stop propagation of events from Portal thats new behavior of react 16
        // https://github.com/facebook/react/issues/11387
        return (
            <span
                data-testid="portal-scroll-anchor"
                className="s-portal-scroll-anchor"
                ref={this.containerRef}
            >
                <Portal node={this.portalNode}>
                    {/* Do not prevent onScroll events - see ONE-4189 for details */}
                    <div
                        id={this.id}
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

        if (!alignPoints || !overlay || !alignTo) {
            return;
        }
        const isSameAsTarget = this.isSameAsTargetPosition(positionType ?? "absolute");
        const optimalAlign = getOptimalAlignment({
            targetRegion: elementRegion(alignTo, isSameAsTarget),
            selfRegion: elementRegion(overlay),
            alignPoints,
            ignoreScrollOffsets: isSameAsTarget,
        });

        // process also if visiblePart is 1 to get dimensions of the overlay
        const shouldApplyConstraints = this.props.ensureVisibility && (optimalAlign.visiblePart ?? 0) > 0;

        const constrainedAlignment = shouldApplyConstraints
            ? this.calculateConstrainedAlignment(optimalAlign.alignment, overlay, positionType === "fixed")
            : optimalAlign.alignment;

        const visiblePartChanged = this.hasVisiblePartChanged(optimalAlign.visiblePart ?? 0);
        const alignmentChanged = alignExceedsThreshold(this.state.alignment, constrainedAlignment);

        if (alignmentChanged || visiblePartChanged) {
            this.setState(
                (prevState) => ({
                    alignment: alignmentChanged ? constrainedAlignment : prevState.alignment,
                    visiblePart: visiblePartChanged ? (optimalAlign.visiblePart ?? 0) : prevState.visiblePart,
                }),
                () => {
                    const alignmentToReport = alignmentChanged
                        ? constrainedAlignment
                        : optimalAlign.alignment;
                    this.props.onAlign?.(alignmentToReport);
                },
            );
        } else {
            this.props.onAlign?.(optimalAlign.alignment);
        }
    };

    private calculateConstrainedAlignment = (
        alignment: Alignment,
        overlay: HTMLElement,
        ignoreScrollOffsets: boolean,
    ): Alignment => {
        const overlayRegion = elementRegion(overlay);
        const { width: originalWidth, height: originalHeight } = overlayRegion;

        const viewportWidth = window.visualViewport?.width || window.innerWidth;
        const viewportHeight = window.visualViewport?.height || window.innerHeight;

        const scrollTop = ignoreScrollOffsets
            ? 0
            : window.visualViewport?.pageTop || window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = ignoreScrollOffsets
            ? 0
            : window.visualViewport?.pageLeft || window.scrollX || document.documentElement.scrollLeft;

        // Calculate the minimum allowed dimensions (50% of original)
        const minWidth = originalWidth * 0.5;
        const minHeight = originalHeight * 0.5;

        const constrainedAlignment = { ...alignment };

        if (constrainedAlignment.left < 0 + scrollLeft) {
            constrainedAlignment.left = 0 + scrollLeft;
        }

        if (constrainedAlignment.top < 0 + scrollTop) {
            constrainedAlignment.top = 0 + scrollTop;
        }

        // Step 2: Calculate if the overlay extends beyond viewport
        const rightEdge = constrainedAlignment.left + originalWidth;
        const bottomEdge = constrainedAlignment.top + originalHeight;

        const exceedsRight = rightEdge > scrollLeft + viewportWidth;
        const exceedsBottom = bottomEdge > scrollTop + viewportHeight;

        if (exceedsRight) {
            const availableWidth = scrollLeft + viewportWidth - constrainedAlignment.left;
            const newWidth = Math.max(availableWidth, minWidth);
            constrainedAlignment.width = newWidth;
            constrainedAlignment.right = undefined;
        } else {
            constrainedAlignment.width = originalWidth;
        }

        if (exceedsBottom) {
            const availableHeight = scrollTop + viewportHeight - constrainedAlignment.top;
            const newHeight = Math.max(availableHeight, minHeight);
            constrainedAlignment.height = newHeight;
        } else {
            constrainedAlignment.height = originalHeight;
        }

        return constrainedAlignment;
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

    private onMaskClick = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!this.props.closeOnOutsideClick) {
            e.stopPropagation();
        }
    };

    protected getZIndex(): number | undefined {
        return this.context ? this.context.getZIndex(this.id) : this.props.zIndex;
    }

    public getOverlayStyles = (): CSSProperties => {
        const { alignTo, positionType } = this.props;
        const { alignment } = this.state;

        const position = this.isSameAsTargetPosition(positionType)
            ? isFixedPosition(alignTo ?? "body")
                ? "fixed"
                : "absolute"
            : positionType;

        // Base styles always applied
        return {
            position,
            left: alignment.left,
            top: alignment.top,
            zIndex: this.getZIndex(),
            visibility: this.isAligned() ? undefined : "hidden",
            ...(this.props.ensureVisibility &&
                alignment.width && {
                    width: alignment.width,
                }),
            ...(this.props.ensureVisibility &&
                alignment.height && {
                    height: alignment.height,
                }),
            width: this.props.width,
            maxWidth: this.props.maxWidth,
        };
    };

    private getOverlayClasses = (): string => {
        return cx(this.props.className, this.getAlignClasses(), this.getVisibilityClass(), {
            "overlay-wrapper": true,
        });
    };

    /**
     * Add CSS classes to overlay wrapper, so they can be used
     * for position of arrows and stuff
     */
    private getAlignClasses = (): string => {
        if (!this.isAligned()) {
            return "";
        }
        const align = this.state.alignment.align.split(" ");

        return `target-${align[0]} self-${align[1]}`;
    };

    private getVisibilityClass = (): string => {
        if (!this.isAligned()) {
            return "";
        }

        return this.props.ensureVisibility && this.state.visiblePart < 1 ? "truncated" : "";
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
        positionType: OverlayPositionType | undefined,
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
        return this.props.shouldCloseOnClick?.(e) ?? true;
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

        const ignoredRefElements = [this.overlayRef.current, ...(this.props.ignoreClicksOn ?? [])];
        const clickInsideIgnoredRefElement = ignoredRefElements.some((ref: any) => {
            return ref?.contains(clickedElement);
        });
        if (clickInsideIgnoredRefElement) {
            return true;
        }

        return (this.props.ignoreClicksOnByClass ?? []).some((selector) => clickedElement.closest(selector));
    };

    private isAligned = () => {
        return this.state.alignment.left !== INIT_STATE_ALIGN && this.state.alignment.top != INIT_STATE_ALIGN;
    };

    // makes assumption that overlays later in the DOM are child overlays
    private isElementInChildOverlay = (element: HTMLElement) => {
        const overlays = Array.from(document.querySelectorAll(".overlay-wrapper"));
        const thisOverlayIndex = overlays.findIndex((overlay) => overlay === this.overlayRef.current);

        return overlays.slice(thisOverlayIndex + 1).some((overlay) => overlay.contains(element));
    };

    public onDocumentMouseDown(e: MouseEvent): void {
        this.clickedInside = (this.overlayRef.current as any).contains(e.target);
        if (this.clickedInside) {
            e.stopPropagation();
        }
    }

    public closeOnParentScroll(e: MouseEvent): void {
        if (!this.isComponentMounted) {
            return;
        }

        if (this.isEventOnParent(e)) {
            this.props.onClose?.();
        }
    }

    public closeOnMouseDrag = (): void => {
        if (!this.isComponentMounted) {
            return;
        }

        this.props.onClose?.();
    };

    public closeOnOutsideClick(e: Event): void {
        if (this.shouldCloseOnClick(e)) {
            this.props.onClose?.();
        }
    }

    public closeOnEscape(e: KeyboardEvent): void {
        if (
            this.isComponentMounted &&
            this.props.closeOnEscape &&
            e.keyCode === ENUM_KEY_CODE.KEY_CODE_ESCAPE
        ) {
            this.props.onClose?.();
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

    private renderMask = (): false | ReactElement => {
        const styles: CSSProperties = {
            zIndex: this.context ? this.context.getZIndex(this.id) : undefined,
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

    private createResizeObserver(): ResizeObserver | undefined {
        // With 100% or more threshold, don't use ResizeObserver
        if ((this.props.resizeObserverThreshold ?? 1) >= 1) {
            return undefined;
        }

        return new ResizeObserver((entries) => {
            const newHeightCandidate = entries[0].contentRect.height;
            const heightDiffersByThreshold =
                Math.abs(this.state.observedHeight - newHeightCandidate) / this.state.observedHeight >
                (this.props.resizeObserverThreshold ?? 1);

            if (heightDiffersByThreshold) {
                this.resizeHandler();
                this.setState({ observedHeight: newHeightCandidate });
            }
        });
    }

    private hasVisiblePartChanged(nextVisiblePart: number): boolean {
        if (!isFinite(nextVisiblePart)) {
            return false;
        }

        return Math.abs(this.state.visiblePart - nextVisiblePart) > VISIBLE_PART_TOLERANCE;
    }
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
