// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import type { IUiComboboxParams } from "./types.js";
import { UiComboboxContextProvider } from "./UiComboboxContext.js";
import { useCombobox } from "./useCombobox.js";

/** @internal */
export interface UiComboboxProps extends IUiComboboxParams {
    children?: ReactNode;
}

/**
 * A composable combobox component that enables users to select from a filtered list of options.
 *
 * @internal
 *
 * @example
 *
 * ```tsx
 * import { UiCombobox, UiComboboxInput, UiComboboxList, UiComboboxPopup } from "@gooddata/sdk-ui-kit";
 *
 * const options = [
 *     { id: "apple", label: "Apple" },
 *     { id: "banana", label: "Banana" },
 *     { id: "apricot", label: "Apricot" },
 * ];
 *
 * <UiCombobox options={options}>
 *     <UiComboboxInput placeholder="Select a fruit..." />
 *     <UiComboboxPopup>
 *         <UiComboboxList />
 *     </UiComboboxPopup>
 * </UiCombobox>
 * ```
 */
export function UiCombobox({ children, ...props }: UiComboboxProps) {
    const state = useCombobox(props);

    return <UiComboboxContextProvider state={state}>{children}</UiComboboxContextProvider>;
}
