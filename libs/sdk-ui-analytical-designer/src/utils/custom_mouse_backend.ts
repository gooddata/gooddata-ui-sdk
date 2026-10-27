// (C) 2021-2026 GoodData Corporation

/*!
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the MIT License.
 *
 * This is a fork of the Touch Backend, which has been adapted for mouse functionality.
 * Its main purpose is to provide an alternative to the HTML5 Backend, for applications which need to
 * circumvent the limitations of HTML5 drag and drop in Edge and IE browsers.
 *
 * The original touch functionality has not been tested and is therefore quite possibly broken.
 */
import {
    type Backend,
    type BackendFactory,
    type DragDropActions,
    type DragDropManager,
    type DragDropMonitor,
    type HandlerRegistry,
    type Unsubscribe,
    type XYCoord,
} from "dnd-core";
import invariant from "invariant";

import { isHostedComponentSelector } from "../appMode/appMode.js";
import { store } from "../reduxStore.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import { type IAppState } from "../store/types.js";

interface IEventName {
    start?: "mousedown" | "touchstart";
    move?: "mousemove" | "touchmove";
    end?: "mouseup" | "touchend";
    contextmenu?: "contextmenu";
    keydown?: "keydown";
    click?: "click";
}

interface ITouchBackendOptions {
    delay?: number;
    enableTouchEvents?: boolean;
    enableMouseEvents?: boolean;
}

enum ListenerType {
    mouse = "mouse",
    touch = "touch",
}

function getEventClientTouchOffset(e: TouchEvent): XYCoord | undefined {
    if (e.targetTouches.length === 1) {
        return getEventClientOffset(e.targetTouches[0]);
    }
    return undefined;
}

function isTouchEvent(e: Touch | TouchEvent | MouseEvent): e is TouchEvent {
    return !!(e as TouchEvent).targetTouches;
}

function getEventClientOffset(e: TouchEvent | Touch | MouseEvent): XYCoord | undefined {
    if (isTouchEvent(e)) {
        return getEventClientTouchOffset(e);
    } else {
        return {
            x: e.clientX,
            y: e.clientY,
        };
    }
}

const ELEMENT_NODE = 1;

function getNodeClientOffset(node: Element): XYCoord | undefined {
    const el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

    if (!el) {
        return null;
    }

    const { top, left } = el.getBoundingClientRect();
    return { x: left, y: top };
}

/** Every name in {@link eventNames} is a mouse or a touch event, so this is what its listeners see. */
type MouseOrTouchListener = (e: MouseEvent | TouchEvent) => void;

const eventNames: Record<ListenerType, IEventName> = {
    mouse: {
        start: "mousedown",
        move: "mousemove",
        end: "mouseup",
        click: "click",
    },
    touch: {
        start: "touchstart",
        move: "touchmove",
        end: "touchend",
    },
};

function getNodesAtOffset(nodes: { [key: string]: HTMLElement }, clientOffset: XYCoord) {
    return Object.keys(nodes).filter((nodeId) => {
        const boundingRect = nodes[nodeId].getBoundingClientRect();
        return (
            clientOffset.x >= boundingRect.left &&
            clientOffset.x <= boundingRect.right &&
            clientOffset.y >= boundingRect.top &&
            clientOffset.y <= boundingRect.bottom
        );
    });
}

function getDistance(p1: Partial<XYCoord>, p2: Partial<XYCoord>) {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;
    return Math.sqrt(a * a + b * b);
}

export class TouchBackend implements Backend {
    private static isSetUp: boolean;

    public actions: DragDropActions;
    public monitor: DragDropMonitor;
    public registry: HandlerRegistry;
    public sourceNodes: { [key: string]: HTMLElement };
    public sourcePreviewNodes: { [key: string]: HTMLElement };
    public sourceNodeOptions: { [key: string]: HTMLElement };
    public sourcePreviewNodeOptions: { [key: string]: unknown };
    public targetNodes: { [key: string]: HTMLElement };
    public delay: number;

    private _mouseClientOffset: Partial<XYCoord>;
    private listenerTypes: ListenerType[];
    private moveStartSourceIds: { [key: string]: boolean };
    private timeout: ReturnType<typeof setTimeout> | undefined;
    private startListenerCapture: boolean;

    constructor(manager: DragDropManager, options: ITouchBackendOptions = {}) {
        options = {
            enableTouchEvents: true,
            enableMouseEvents: false,
            delay: 0,
            ...options,
        };

        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.registry = manager.getRegistry();

        this.delay = options.delay;
        this.sourceNodes = {};
        this.sourceNodeOptions = {};
        this.sourcePreviewNodes = {};
        this.sourcePreviewNodeOptions = {};
        this.moveStartSourceIds = {};
        this.targetNodes = {};
        this.listenerTypes = [];
        this._mouseClientOffset = null;
        this.startListenerCapture = false;

        if (options.enableMouseEvents) {
            this.listenerTypes.push(ListenerType.mouse);
        }

        if (options.enableTouchEvents) {
            this.listenerTypes.push(ListenerType.touch);
        }
    }

    public profile(): Record<string, number> {
        return {};
    }

    public startHandler() {
        return this.delay ? this.handleTopMoveStartDelay : this.handleTopMoveStart;
    }

    public setup() {
        if (typeof window === "undefined") {
            return;
        }

        invariant(!TouchBackend.isSetUp, "Cannot have two Touch backends at the same time.");
        TouchBackend.isSetUp = true;

        /**
         * We should cancel drag only in embedded mode.
         */
        const isEmbedded = getIsEmbedded(store.getState() as unknown as IAppState);
        if (isEmbedded) {
            document.onmouseout = (event) => {
                /**
                 * The relatedTarget with the mouseout event can be used to indicate the element the cursor just entered.
                 * It means that if you leave the "window", there is no element.
                 */
                if (event.relatedTarget === null && this.monitor.isDragging()) {
                    this.cancelDrag();
                }
            };
        }

        /**
         * Hosted-component mode: AD shares the page with a host whose sdk-ui-kit Overlay (with
         * closeOnOutsideClick) registers a document-level mousedown listener that stopPropagation()s
         * inside-clicks, so a bubble-phase window listener would never see the drag-start mousedown.
         * Capture phase runs window-first, before any document handler, and is immune to that. The
         * drag gating is unaffected: beginDrag still requires the bubble-phase source-node listener
         * (handleMoveStart) to have fired. Standalone/pluggable keep the original bubble phase.
         */
        this.startListenerCapture = isHostedComponentSelector(store.getState() as unknown as IAppState);

        this.addEventListener(window, "start", this.startHandler(), this.startListenerCapture);
        this.addEventListener(window, "start", this.handleTopMoveStartCapture, true);
        this.addEventListener(window, "move", this.handleTopMoveCapture, true);
        this.addEventListener(window, "end", this.handleTopMoveEndCapture, true);
    }

    public teardown() {
        if (typeof window === "undefined") {
            return;
        }

        TouchBackend.isSetUp = false;
        this._mouseClientOffset = null;

        this.removeEventListener(window, "start", this.startHandler(), this.startListenerCapture);
        this.removeEventListener(window, "start", this.handleTopMoveStartCapture, true);
        this.removeEventListener(window, "move", this.handleTopMoveCapture, true);
        this.removeEventListener(window, "end", this.handleTopMoveEndCapture, true);
    }

    private addEventListener<K extends keyof IEventName>(
        subject: HTMLElement | Window,
        event: K,
        handler: MouseOrTouchListener,
        capture?: boolean,
    ) {
        this.listenerTypes.forEach(function (listenerType) {
            const eventName = eventNames[listenerType][event];
            if (eventName) {
                // the DOM types the listener by the event name only when that name is a literal
                subject.addEventListener(eventName, handler as EventListener, capture);
            }
        });
    }

    private removeEventListener<K extends keyof IEventName>(
        subject: HTMLElement | Window,
        event: K,
        handler: MouseOrTouchListener,
        capture?: boolean,
    ) {
        this.listenerTypes.forEach(function (listenerType) {
            const eventName = eventNames[listenerType][event];
            if (eventName) {
                subject.removeEventListener(eventName, handler as EventListener, capture);
            }
        });
    }

    public connectDragSource(sourceId: string, node: HTMLElement): Unsubscribe {
        const handleMoveStart = this.handleMoveStart.bind(this, sourceId);
        const handleCancelClick = this.handleCancelClick.bind(this, sourceId);

        this.sourceNodes[sourceId] = node;

        this.addEventListener(node, "start", handleMoveStart);
        this.addEventListener(node, "click", handleCancelClick, true);

        return () => {
            delete this.sourceNodes[sourceId];
            this.removeEventListener(node, "start", handleMoveStart);
            this.removeEventListener(node, "click", handleCancelClick, true);
        };
    }

    public connectDragPreview(sourceId: string, node: HTMLElement, options: unknown): Unsubscribe {
        this.sourcePreviewNodeOptions[sourceId] = options;
        this.sourcePreviewNodes[sourceId] = node;

        return () => {
            delete this.sourcePreviewNodes[sourceId];
            delete this.sourcePreviewNodeOptions[sourceId];
        };
    }

    public connectDropTarget(targetId: string, node: HTMLElement): Unsubscribe {
        this.targetNodes[targetId] = node;

        return () => {
            delete this.targetNodes[targetId];
        };
    }

    private getSourceClientOffset = (sourceId: string): XYCoord | undefined => {
        return getNodeClientOffset(this.sourceNodes[sourceId]);
    };

    public handleTopMoveStartCapture = (_e: Event): void => {
        this.moveStartSourceIds = {};
    };

    public handleMoveStart = (sourceId: string): void => {
        this.moveStartSourceIds[sourceId] = true;
    };

    public handleCancelClick = (sourceId: string, e: Event): void => {
        if (this.moveStartSourceIds[sourceId]) {
            e.stopPropagation();
        }
    };

    public handleTopMoveStart = (e: MouseEvent | TouchEvent): void => {
        const clientOffset = getEventClientOffset(e);
        if (clientOffset && getNodesAtOffset(this.sourceNodes, clientOffset).length > 0) {
            this._mouseClientOffset = clientOffset;

            // note: calling preventDefault here, seems to be the only way to defeat text selection in Safari
            // to handle other browsers, we could just call window.getSelection().removeAllRanges();
            const target = e.target as HTMLElement;
            if (target.tagName !== "SELECT" && target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
                e.preventDefault();

                // when clicking on draggable (DragSource decorated) component, document.activeElement doesn't change
                // the following resets document.activeElement to document.body
                const activeElement = document.activeElement as HTMLBodyElement;
                if (activeElement && typeof activeElement.blur === "function") {
                    activeElement.blur();
                }
            }
        }
    };

    public handleTopMoveStartDelay = (e: MouseEvent | TouchEvent): void => {
        this.timeout = setTimeout(this.handleTopMoveStart.bind(this, e), this.delay);
    };

    public handleTopMoveCapture = (e: MouseEvent | TouchEvent): void => {
        clearTimeout(this.timeout);

        const clientOffset = getEventClientOffset(e);
        if (!clientOffset) {
            return;
        }

        // If we're not dragging and we've moved a little, that counts as a drag start
        if (!this.monitor.isDragging()) {
            if (this._mouseClientOffset && getDistance(this._mouseClientOffset, clientOffset) > 2) {
                const sourceIdsArray = Object.keys(this.moveStartSourceIds);
                if (sourceIdsArray.length > 0) {
                    e.preventDefault();

                    this.actions.beginDrag(sourceIdsArray, {
                        clientOffset: this._mouseClientOffset,
                        getSourceClientOffset: this.getSourceClientOffset,
                        publishSource: false,
                    });

                    this._mouseClientOffset = null;
                }
            }

            return;
        }

        this.actions.publishDragSource();

        e.preventDefault();

        const matchingTargetIds = getNodesAtOffset(this.targetNodes, clientOffset);
        this.actions.hover(matchingTargetIds, { clientOffset });
    };

    public handleTopMoveEndCapture = (e: Event): void => {
        this._mouseClientOffset = null;

        if (!this.monitor.isDragging() || this.monitor.didDrop()) {
            this.moveStartSourceIds = {};
            return;
        }

        e.preventDefault();

        this.actions.drop();
        this.actions.endDrag();
    };

    cancelDrag() {
        this._mouseClientOffset = null;
        this.actions.drop();
        this.actions.endDrag();
    }
}

export function createCustomMouseBackend(): BackendFactory {
    return (manager: DragDropManager) => {
        return new TouchBackend(manager, { enableMouseEvents: true, enableTouchEvents: false });
    };
}
