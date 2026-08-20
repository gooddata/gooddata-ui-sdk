// (C) 2026 GoodData Corporation

import { useState } from "react";

/**
 * A drop-in stand-in for {@link AsCodeEditorBody} that swaps its CodeMirror editor for a plain
 * textarea, so a dialog test can read and type the YAML with `fireEvent.change`.
 *
 * The real body is `lazy()`-loaded by the dialog, and only for the editor half — nothing else in
 * the dialog under test comes through it — so a test replaces just this module rather than the
 * `@gooddata/sdk-ui-kit` barrel every other component also imports:
 *
 * ```ts
 * vi.mock("../AsCodeEditorBody.js", () => import("./asCodeEditorBody.test.utils.js"));
 * ```
 *
 * Local state seeded from `initialValue` mirrors the real body: the dialog reads the current value
 * from `onChange` and never drives it back in.
 */
export function AsCodeEditorBody({
    initialValue,
    onChange,
    disabled,
}: {
    initialValue: string;
    onChange: (value: string) => void;
    disabled: boolean;
}) {
    const [value, setValue] = useState(initialValue);

    return (
        <textarea
            data-testid="yaml-editor"
            value={value}
            disabled={disabled}
            onChange={(e) => {
                setValue(e.target.value);
                onChange(e.target.value);
            }}
        />
    );
}
