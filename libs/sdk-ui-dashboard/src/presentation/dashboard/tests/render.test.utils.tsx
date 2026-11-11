// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import {
    type RenderOptions,
    type RenderResult,
    render as testingLibraryRender,
} from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";
import { merge } from "lodash-es";
import { Provider } from "react-redux";

import { dummyBackend } from "@gooddata/sdk-backend-base";
import { _cloneDeep, _omit } from "@gooddata/util";

import { type DashboardState, ReactDashboardContext } from "../../../index.js";
import { createDashboardRootReducer, createDashboardStore } from "../../../model/store/dashboardStore.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

interface ISetupOptions extends RenderOptions {
    // Support for bootstrapping dashboard redux state.
    state?: DeepPartial<DashboardState>;
}

/**
 * Return type of the `render` needs to be explicit, because otherwise an error appears saying that the inferred
 * type of render cannot be named without a reference to pretty-format (pretty-format is transitive dependency
 * of Testing Library).
 * This seems to be a bug within tsgo (see https://github.com/microsoft/typescript-go/issues/2277 for more details).
 * Remove the `RenderResult & { user: UserEvent }` explicit type annotation once the issues get fixed in tsgo.
 */
export function render(jsx: ReactNode, options: ISetupOptions = {}): RenderResult & { user: UserEvent } {
    const { state = {} } = options;

    const preloadedState = merge(
        _cloneDeep(configureStore({ reducer: createDashboardRootReducer() }).getState()),
        /**
         * Setting empty config and permissions is needed here because otherwise an invariant violation error
         * about attempting to access uninitialized state appears from the respective selectors in tests.
         */
        { config: { config: {} }, permissions: { permissions: {} } },
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
            _omit(options, "state"),
        ),
    };
}
