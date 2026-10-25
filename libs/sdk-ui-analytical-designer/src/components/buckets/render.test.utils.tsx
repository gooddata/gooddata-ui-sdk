// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { DndProvider } from "@evil-internetmann/react-dnd";
import {
    type RenderOptions,
    type RenderResult,
    render as testingLibraryRender,
} from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";
import { Provider } from "react-redux";

import { createStore } from "../../create_store.js";
import { createCustomMouseBackend } from "../../utils/custom_mouse_backend.js";
import { TranslationsWrapper } from "../../utils/with_connected_intl.js";

export function render(jsx: ReactNode, options: RenderOptions = {}): RenderResult & { user: UserEvent } {
    const dndBackend = createCustomMouseBackend();
    const { store } = createStore();

    return {
        /**
         * `delay: null` opts out of user-event's default `delay: 0`, which awaits a real
         * `setTimeout` macrotask between every simulated event. Tests driving pointer/keyboard
         * sequences fire dozens of those events, so the waits — not the rendering — dominate the
         * runtime, and they get proportionally worse under CI thread contention.
         *
         * Add a `delay` back (via an option on this helper) only if a test needs timers to advance
         * between events, e.g. to flush a debounce.
         */
        user: userEvent.setup({ delay: null }),
        ...testingLibraryRender(
            <DndProvider backend={dndBackend}>
                <Provider store={store}>
                    <TranslationsWrapper>{jsx}</TranslationsWrapper>
                </Provider>
            </DndProvider>,
            options,
        ),
    };
}
