// (C) 2026 GoodData Corporation

/**
 * Key events a modal dialog handles itself. React bubbles the events of a portaled modal through
 * the component tree that opened it, including the menus the modal portals out of its own DOM,
 * so a focus trap around that component must leave them to the modal.
 */
const modalOwnedEvents = new WeakSet<Event>();

export function markModalOwnedEvent(event: Event): void {
    modalOwnedEvents.add(event);
}

export function isModalOwnedEvent(event: Event): boolean {
    return modalOwnedEvents.has(event);
}
