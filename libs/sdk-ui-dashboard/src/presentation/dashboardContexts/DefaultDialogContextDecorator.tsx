// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

/**
 * Default for the dialog context-decorator slots: renders children with the dialog context untouched.
 *
 * @internal
 */
export function DefaultDialogContextDecorator({ children }: { children?: ReactNode }): ReactElement {
    return <>{children}</>;
}
