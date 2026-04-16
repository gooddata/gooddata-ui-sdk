// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import {
    type RenderOptions,
    type RenderResult,
    render as testingLibraryRender,
} from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";

import { IntlWrapper } from "@gooddata/sdk-ui";

/**
 * Return type of the `render` needs to be explicit, because then an `The inferred type of 'render' cannot be named
 * without a reference to pretty-format` error appears (pretty-format is transitive dependency of Testing Library).
 * This seems to be a bug within tsgo (see https://github.com/microsoft/typescript-go/issues/2277 for more details).
 * Remove the `RenderResult & { user: UserEvent }` explicit type annotation once the issues get fixed in tsgo.
 */
export function render(jsx: ReactNode, options: RenderOptions = {}): RenderResult & { user: UserEvent } {
    return {
        user: userEvent.setup(),
        ...testingLibraryRender(<IntlWrapper>{jsx}</IntlWrapper>, options),
    };
}
