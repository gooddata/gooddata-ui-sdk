// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import {
    type RenderOptions,
    type RenderResult,
    render as testingLibraryRender,
} from "@testing-library/react";
import { type UserEvent, userEvent } from "@testing-library/user-event";

import { InternalIntlWrapper } from "../src/internal/index.js";

/**
 * Return type of the `render` needs to be explicit, because then an `The inferred type of 'render' cannot be named
 * without a reference to 'PrettyFormatOptions'` error appears (pretty-format is transitive dependency of Testing Library).
 *
 * This function is intended as a global render function that can be used in any component test here in the package.
 * If you feel that they are missing here some additional providers (of global relevance), feel free to add them here.
 */
export function render(jsx: ReactNode, options: RenderOptions = {}): RenderResult & { user: UserEvent } {
    return {
        user: userEvent.setup(),
        ...testingLibraryRender(<InternalIntlWrapper>{jsx}</InternalIntlWrapper>, options),
    };
}
