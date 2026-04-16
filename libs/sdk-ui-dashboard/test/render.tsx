// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import {
    type RenderOptions,
    type RenderResult,
    render as testingLibraryRender,
} from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";
import { cloneDeep, merge, omit } from "lodash-es";
import { Provider } from "react-redux";

import { dummyBackend } from "@gooddata/sdk-backend-base";

import { type DashboardState, ReactDashboardContext } from "../src/index.js";
import { createDashboardRootReducer, createDashboardStore } from "../src/model/store/dashboardStore.js";
import { IntlWrapper } from "../src/presentation/localization/IntlWrapper.js";

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

interface ISetupOptions extends RenderOptions {
    // Support for bootstrapping dashboard redux state.
    state?: DeepPartial<DashboardState>;
}

/**
 * Return type of the `render` needs to be explicit, because then an `The inferred type of 'render' cannot be named
 * without a reference to pretty-format` error appears (pretty-format is transitive dependency of Testing Library).
 * This seems to be a bug within tsgo (see https://github.com/microsoft/typescript-go/issues/2277 for more details).
 * Remove the `RenderResult & { user: UserEvent }` explicit type annotation once the issues get fixed in tsgo.
 */
export function render(jsx: ReactNode, options: ISetupOptions = {}): RenderResult & { user: UserEvent } {
    const { state = {} } = options;

    const preloadedState = merge(
        cloneDeep(configureStore({ reducer: createDashboardRootReducer() }).getState()),
        /**
         * Setting empty config is needed here because otherwise an `Invariant Violation: attempting to access
         * uninitialized config state` error from `configSelectors.ts` in tests appears.
         */
        { config: { config: {} } },
        state,
    );

    const { store } = createDashboardStore({
        // Bootstrap store with required values
        dashboardContext: { backend: dummyBackend(), workspace: "test-workspace" },
        initialRenderMode: "view",
        backgroundWorkers: [],
        preloadedState,
    });

    return {
        user: userEvent.setup(),
        ...testingLibraryRender(
            <Provider store={store} context={ReactDashboardContext}>
                <IntlWrapper>{jsx}</IntlWrapper>
            </Provider>,
            omit(options, "state"),
        ),
    };
}
