// (C) 2026 GoodData Corporation

/**
 * Container slots for suites that mount strictly one scenario at a time.
 *
 * `@testing-library/react` creates a brand new container element for every `render` call. React then has to
 * treat that element as a fresh root: it runs `listenToAllSupportedEvents` on it, which registers roughly
 * eighty delegated listeners, and happy-dom has to build an event-listener bucket for each of them. The
 * smoke-and-capture suite performs two mounts per scenario for well over a thousand scenarios, so this
 * per-container setup is paid thousands of times for containers that are thrown away microseconds later.
 *
 * Handing `render` a container that was already used makes React skip the whole registration - the
 * container still carries the listening marker from the previous mount - while `cleanup()` keeps
 * unmounting the tree between tests exactly as before.
 *
 * A slot may only be shared by mounts that never overlap: rendering into a container that still holds a
 * live root re-uses that root and therefore unmounts the tree that is already there. Suites that keep
 * several mounts alive at once (the api-regression ones start every scenario's mount during collection)
 * must not use this.
 */
const containers = new Map<string, HTMLElement>();

/**
 * Returns the reusable, detached container for the given slot.
 *
 * The container is deliberately not attached to `document.body`: nothing in these suites queries the
 * rendered markup, and keeping it detached also narrows the `getRootNode().querySelector(...)` lookups
 * that the pluggable visualizations do down to the scenario's own subtree instead of the whole document.
 *
 * @param slot - identifies a set of mutually exclusive mounts, e.g. "chart" or "plug-viz"
 */
export function sequentialContainer(slot: string): HTMLElement {
    let container = containers.get(slot);

    if (!container) {
        container = document.createElement("div");
        containers.set(slot, container);
    }

    return container;
}
