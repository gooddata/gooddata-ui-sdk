// (C) 2026 GoodData Corporation

import { bem } from "../@utils/bem.js";

const { b } = bem("gd-ui-kit-toolbar-divider");

/**
 * Vertical rule that separates groups inside a {@link UiToolbar}.
 *
 * @internal
 */
export function UiToolbarDivider() {
    return <div className={b()} role="separator" aria-orientation="vertical" />;
}
