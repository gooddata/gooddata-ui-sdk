// (C) 2025 GoodData Corporation

import { type KeyboardEvent, act } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type UiTreeViewEventType,
    type UiTreeViewEvents,
    UiTreeViewEventsProvider,
    useUiTreeViewEventPublisher,
    useUiTreeViewEventSubscriber,
} from "../UiTreeViewEvents.js";

// Test components to exercise the hooks
function TestPublisher({
    eventType,
    event,
}: {
    eventType: UiTreeViewEventType;
    event: UiTreeViewEvents[UiTreeViewEventType];
}) {
    const onKeyDown = useUiTreeViewEventPublisher(eventType);

    return <button onKeyDown={() => onKeyDown(event)}>Publisher</button>;
}

function TestSubscriber({
    eventType,
    onEvent,
}: {
    eventType: UiTreeViewEventType;
    onEvent: (event: UiTreeViewEvents[UiTreeViewEventType]) => void;
}) {
    useUiTreeViewEventSubscriber(eventType, onEvent);

    return <div>Subscriber</div>;
}

describe("UiTreeViewEvents", () => {
    it("should render children without crashing", () => {
        render(<UiTreeViewEventsProvider>Test Child</UiTreeViewEventsProvider>);

        expect(screen.getByText("Test Child")).toBeVisible();
    });

    it("should publish keydown events", () => {
        const mockEvent = { key: "Enter" } as KeyboardEvent;
        const onEvent = vi.fn();

        render(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent} />
                <TestSubscriber eventType="keydown" onEvent={onEvent} />
            </UiTreeViewEventsProvider>,
        );

        fireEvent.keyDown(screen.getByText("Publisher"), { key: "Enter" });

        expect(onEvent).toHaveBeenCalledWith(mockEvent);
        expect(onEvent).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple publishers for the same event type", () => {
        const mockEvent1 = { key: "Enter" } as KeyboardEvent;
        const mockEvent2 = { key: "Escape" } as KeyboardEvent;
        const onEvent = vi.fn();

        render(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent1} />
                <TestPublisher eventType="keydown" event={mockEvent2} />
                <TestSubscriber eventType="keydown" onEvent={onEvent} />
            </UiTreeViewEventsProvider>,
        );

        const buttons = screen.getAllByText("Publisher");
        fireEvent.keyDown(buttons[0], { key: "Enter" });
        fireEvent.keyDown(buttons[1], { key: "Escape" });

        expect(onEvent).toHaveBeenCalledWith(mockEvent1);
        expect(onEvent).toHaveBeenCalledWith(mockEvent2);
        expect(onEvent).toHaveBeenCalledTimes(2);
    });

    it("should handle multiple subscribers for the same event", () => {
        const mockEvent = { key: "Tab" } as unknown as KeyboardEvent;
        const onEvent1 = vi.fn();
        const onEvent2 = vi.fn();

        render(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent} />
                <TestSubscriber eventType="keydown" onEvent={onEvent1} />
                <TestSubscriber eventType="keydown" onEvent={onEvent2} />
            </UiTreeViewEventsProvider>,
        );

        fireEvent.keyDown(screen.getByText("Publisher"), { key: "Tab" });

        expect(onEvent1).toHaveBeenCalledWith(mockEvent);
        expect(onEvent2).toHaveBeenCalledWith(mockEvent);
    });

    it("should unsubscribe when component unmounts", () => {
        const mockEvent = { key: "Space" } as KeyboardEvent;
        const onEvent = vi.fn();

        const { unmount } = render(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent} />
                <TestSubscriber eventType="keydown" onEvent={onEvent} />
            </UiTreeViewEventsProvider>,
        );

        // Publish event before unmount
        fireEvent.keyDown(screen.getByText("Publisher"), { key: "Space" });
        expect(onEvent).toHaveBeenCalledTimes(1);

        // Unmount subscriber
        unmount();

        // Re-render publisher only
        render(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent} />
            </UiTreeViewEventsProvider>,
        );

        // Publish event after unmount
        fireEvent.keyDown(screen.getByText("Publisher"), { key: "Space" });

        // Should not have been called again since subscriber is unmounted
        expect(onEvent).toHaveBeenCalledTimes(1);
    });

    it("should not throw when used outside of provider", () => {
        const mockEvent = { key: "Enter" } as KeyboardEvent;

        // This should not throw, but the publisher won't work
        expect(() => {
            render(<TestPublisher eventType="keydown" event={mockEvent} />);
        }).not.toThrow();
    });

    // eslint-disable-next-line @vitest/no-identical-title
    it("should not throw when used outside of provider", () => {
        const onEvent = vi.fn();

        expect(() => {
            render(<TestSubscriber eventType="keydown" onEvent={onEvent} />);
        }).not.toThrow();
    });

    it("should handle handler function changes", () => {
        const mockEvent = { key: "Home" } as KeyboardEvent;
        const onEvent1 = vi.fn();
        const onEvent2 = vi.fn();

        const { rerender } = render(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent} />
                <TestSubscriber eventType="keydown" onEvent={onEvent1} />
            </UiTreeViewEventsProvider>,
        );

        // Publish event with first handler
        fireEvent.keyDown(screen.getByText("Publisher"), { key: "Home" });
        expect(onEvent1).toHaveBeenCalledWith(mockEvent);
        onEvent1.mockClear();

        // Change handler
        rerender(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent} />
                <TestSubscriber eventType="keydown" onEvent={onEvent2} />
            </UiTreeViewEventsProvider>,
        );

        // Publish event with second handler
        fireEvent.keyDown(screen.getByText("Publisher"), { key: "Home" });
        expect(onEvent1).not.toHaveBeenCalled();
        expect(onEvent2).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle rapid successive events", () => {
        const mockEvent = { key: "ArrowDown" } as KeyboardEvent;
        const onEvent = vi.fn();

        render(
            <UiTreeViewEventsProvider>
                <TestPublisher eventType="keydown" event={mockEvent} />
                <TestSubscriber eventType="keydown" onEvent={onEvent} />
            </UiTreeViewEventsProvider>,
        );

        const button = screen.getByText("Publisher");

        // Rapidly click multiple times
        act(() => {
            fireEvent.keyDown(button, { key: "ArrowDown" });
            fireEvent.keyDown(button, { key: "ArrowDown" });
            fireEvent.keyDown(button, { key: "ArrowDown" });
        });

        expect(onEvent).toHaveBeenCalledTimes(3);
        expect(onEvent).toHaveBeenNthCalledWith(1, mockEvent);
        expect(onEvent).toHaveBeenNthCalledWith(2, mockEvent);
        expect(onEvent).toHaveBeenNthCalledWith(3, mockEvent);
    });
});
