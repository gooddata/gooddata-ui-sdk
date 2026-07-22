// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { SeparatorLine } from "../../../SeparatorLine/SeparatorLine.js";

/**
 * The design-system menu divider visual, shared by every widget that renders separator items.
 *
 * @internal
 */
export function MenuDivider(): ReactElement {
    return <SeparatorLine pT={5} pR={10} pB={4} pL={10} />;
}
