// (C) 2026 GoodData Corporation

import { useLayoutEffect, useRef } from "react";

interface IBeamState {
    center: number;
    length: number;
    head: number;
    speed: number;
    mode: "run" | "cruise" | "spring";
    lap: number;
    velocity: number;
}

const speed = 1 / 3.6;
const springAt = 0.05;
const stiffness = 7;
const damping = 0.55;

export function DashboardAiComposingOverlay({ isWaiting }: { isWaiting: boolean }) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<IBeamState | null>(null);

    useLayoutEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) {
            return;
        }

        const rects = Array.from(overlay.querySelectorAll("rect"));
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let state = stateRef.current;
        let width = 0;
        let perimeter = 0;
        let previousTime: number | undefined;
        let frame: number | undefined;

        const segment = (rect: SVGRectElement, start: number, length: number) => {
            rect.style.strokeDasharray = `${length} ${Math.max(0, perimeter - length)}`;
            rect.style.strokeDashoffset = String(-(((start % perimeter) + perimeter) % perimeter));
        };

        const animate = (time: number) => {
            frame = undefined;
            if (!state || !perimeter) {
                return;
            }

            const dt = Math.min(0.05, (time - (previousTime ?? time)) / 1000);
            previousTime = time;
            const top = width / 2 / perimeter;
            const runningLength = Math.min(600, perimeter * 0.25);
            const waitingLength = Math.min(120, runningLength);
            let settled = false;

            if (isWaiting && state.mode === "run") {
                state.mode = "cruise";
                state.lap = Math.ceil(state.center + springAt - top);
            } else if (!isWaiting && state.mode !== "run") {
                state.mode = "run";
                state.speed = 0;
            }

            if (reducedMotion.matches) {
                state.center = top;
                state.length = isWaiting ? waitingLength : runningLength;
                state.head = isWaiting ? 0 : 1;
                state.lap = 0;
                state.velocity = 0;
                state.speed = 0;
                state.mode = isWaiting ? "spring" : "run";
                settled = true;
            } else if (state.mode === "cruise") {
                state.center += speed * dt;
                if (state.lap + top - state.center <= springAt) {
                    state.mode = "spring";
                    state.velocity = speed;
                }
            } else if (state.mode === "spring") {
                // Keep the spring target aligned with the top center while the dashboard resizes.
                const target = state.lap + top;
                const steps = Math.max(1, Math.ceil(dt * 240));
                const step = dt / steps;
                for (let i = 0; i < steps; i++) {
                    const acceleration =
                        -stiffness * stiffness * (state.center - target) -
                        2 * damping * stiffness * state.velocity;
                    state.velocity += acceleration * step;
                    state.center += state.velocity * step;
                }
                const easing = 1 - Math.exp(-dt * 3.2);
                state.length += (waitingLength - state.length) * easing;
                state.head += -state.head * easing;
                settled =
                    Math.abs(state.center - target) < 0.00001 &&
                    Math.abs(state.velocity) < 0.00001 &&
                    Math.abs(state.length - waitingLength) < 0.01 &&
                    state.head < 0.0001;
                if (settled) {
                    state.center = target;
                    state.length = waitingLength;
                    state.head = 0;
                }
            } else {
                state.speed = Math.min(1, state.speed + dt / 0.9);
                state.center += speed * dt * state.speed * state.speed;
                const easing = 1 - Math.exp(-dt * 2.5);
                state.length += (runningLength - state.length) * easing;
                state.head += (1 - state.head) * easing;
            }

            const start = state.center * perimeter - state.length / 2;
            const coreLength = state.length * 0.55;
            const coreStart = start + (state.length - coreLength) * (0.5 + 0.5 * state.head);
            const [bloom, glow, tail, core] = rects;
            segment(tail, start, state.length);
            for (const rect of [bloom, glow, core]) {
                segment(rect, coreStart, coreLength);
            }

            if (!settled) {
                frame = requestAnimationFrame(animate);
            }
        };

        const refresh = () => {
            if (frame !== undefined) {
                cancelAnimationFrame(frame);
            }
            previousTime = undefined;
            animate(performance.now());
        };

        const fit = () => {
            width = Math.max(0, overlay.clientWidth - 2);
            const height = Math.max(0, overlay.clientHeight - 2);
            perimeter = width && height ? 2 * (width + height) : 0;
            for (const rect of rects) {
                rect.setAttribute("width", String(width));
                rect.setAttribute("height", String(height));
            }
            if (!state && perimeter) {
                state = {
                    center: isWaiting ? width / 2 / perimeter : 0.62,
                    length: isWaiting ? Math.min(120, perimeter * 0.25) : Math.min(600, perimeter * 0.25),
                    head: isWaiting ? 0 : 1,
                    speed: 1,
                    mode: isWaiting ? "spring" : "run",
                    lap: 0,
                    velocity: 0,
                };
                stateRef.current = state;
            }
            refresh();
        };

        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(fit);
        observer?.observe(overlay);
        window.addEventListener("resize", fit);
        reducedMotion.addEventListener("change", refresh);
        fit();

        return () => {
            if (frame !== undefined) {
                cancelAnimationFrame(frame);
            }
            observer?.disconnect();
            window.removeEventListener("resize", fit);
            reducedMotion.removeEventListener("change", refresh);
        };
    }, [isWaiting]);

    return (
        <div
            data-testid="gd-dashboard-ai-composing-overlay"
            className="gd-dashboard-ai-composing-overlay"
            ref={overlayRef}
            aria-hidden="true"
        >
            {["bloom", "glow", "tail", "core"].map((layer) => (
                <svg key={layer} className={`gd-dashboard-ai-composing-overlay__${layer}`} focusable="false">
                    <rect x="1" y="1" width="0" height="0" />
                </svg>
            ))}
        </div>
    );
}
