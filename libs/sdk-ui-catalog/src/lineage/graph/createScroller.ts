// (C) 2025-2026 GoodData Corporation

import type * as joint from "@joint/core";

const ZOOM_STEP = 0.5;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

class PaperScroller {
    public el: HTMLDivElement;

    private onZoom: ((zoom: number) => void) | undefined;
    private paper: joint.dia.Paper;
    private isPanning: boolean = false;
    private lastPointerPosition: { x: number; y: number } | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private currentZoom: number = 1;

    private mouseMoveHandler = (evt: MouseEvent) => this.onMouseMove(evt);
    private mouseUpHandler = () => this.onMouseUp();

    constructor(
        paper: joint.dia.Paper,
        opts: {
            onZoom?: (zoom: number) => void;
        } = {},
    ) {
        this.paper = paper;
        this.onZoom = opts?.onZoom;
        this.el = document.createElement("div");
        this.el.style.overflow = "hidden";
        this.el.style.width = "100%";
        this.el.style.height = "100%";
        this.el.style.cursor = "grab";
        this.el.style.position = "relative";

        this.el.appendChild(this.paper.el);

        this.setupPanning();
        this.setupZooming();
        this.setupResize();
    }

    private setupResize() {
        const resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        resizeObserver.observe(this.el);
        this.resizeObserver = resizeObserver;
    }

    private handleResize() {
        const { width, height } = this.el.getBoundingClientRect();
        this.paper.setDimensions(width, height);
    }

    private setupPanning() {
        this.paper.on("blank:pointerdown", (evt: joint.dia.Event) => {
            this.isPanning = true;
            this.lastPointerPosition = { x: evt.clientX ?? 0, y: evt.clientY ?? 0 };
            this.el.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", this.mouseMoveHandler);
        window.addEventListener("mouseup", this.mouseUpHandler);
    }

    private onMouseMove(evt: MouseEvent) {
        if (!this.isPanning || !this.lastPointerPosition) {
            return;
        }

        const dx = evt.clientX - this.lastPointerPosition.x;
        const dy = evt.clientY - this.lastPointerPosition.y;

        this.lastPointerPosition = { x: evt.clientX, y: evt.clientY };

        const currentTranslate = this.paper.translate();
        this.paper.translate(currentTranslate.tx + dx, currentTranslate.ty + dy);
    }

    private onMouseUp() {
        this.isPanning = false;
        this.lastPointerPosition = null;
        this.el.style.cursor = "grab";
    }

    private setupZooming() {
        this.paper.on("blank:mousewheel", (evt: joint.dia.Event, _x: number, _y: number, delta: number) => {
            evt.preventDefault();
            this.zoom(delta);
        });
    }

    private zoom(delta: number) {
        const oldScale = this.paper.scale().sx;
        const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldScale + delta * 0.1));

        if (oldScale !== newScale) {
            this.paper.scale(newScale, newScale);
            this.currentZoom = newScale;
        }

        this.onZoom?.(newScale);
    }

    public isZoomInEnable() {
        return this.currentZoom < MAX_ZOOM;
    }

    public zoomIn() {
        this.zoom(ZOOM_STEP);
    }

    public isZoomOutEnable() {
        return this.currentZoom > MIN_ZOOM;
    }

    public zoomOut() {
        this.zoom(-ZOOM_STEP);
    }

    public reset() {
        const root = this.paper.model.getElements().find((el) => el.get("root"));

        if (!root) {
            return;
        }

        this.paper.scale(1, 1);
        this.currentZoom = 1;

        const point = root.position();
        const size = root.size();
        const x = point.x + size.width / 2;
        const y = point.y + size.height / 2;

        this.onZoom?.(this.currentZoom);
        this.center(x, y);
    }

    public expand() {
        const elements = this.paper.model.getElements();
        if (elements.length === 0) {
            return;
        }

        const bbox = this.paper.getContentBBox();
        const { width: containerWidth, height: containerHeight } = this.el.getBoundingClientRect();

        const padding = 20;
        const availableWidth = containerWidth - padding * 2;
        const availableHeight = containerHeight - padding * 2;
        const bboxWidth = bbox.width / this.currentZoom;
        const bboxHeight = bbox.height / this.currentZoom;

        const scaleX = availableWidth / bboxWidth;
        const scaleY = availableHeight / bboxHeight;

        const newScale = Math.min(scaleX, scaleY);

        this.paper.scale(newScale, newScale);
        this.currentZoom = newScale;

        const centerX = bboxWidth / 2;
        const centerY = bboxHeight / 2;

        this.onZoom?.(newScale);
        this.center(centerX, centerY);
    }

    public center(x: number, y: number) {
        const { width, height } = this.el.getBoundingClientRect();
        const scale = this.paper.scale().sx;

        // Calculate the translation to center the point (x, y)
        // x and y are in local graph coordinates
        const tx = width / 2 - x * scale;
        const ty = height / 2 - y * scale;

        this.paper.translate(tx, ty);
    }

    public dispose() {
        window.removeEventListener("mousemove", this.mouseMoveHandler);
        window.removeEventListener("mouseup", this.mouseUpHandler);
        this.resizeObserver?.disconnect();
        this.paper.off("blank:pointerdown");
        this.paper.off("blank:mousewheel");
    }
}

export function createScroller(paper: joint.dia.Paper, onZoom: (zoom: number) => void) {
    return new PaperScroller(paper, {
        onZoom,
    });
}
