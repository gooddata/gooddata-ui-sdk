// (C) 2026 GoodData Corporation

import { Children, Fragment, type ReactNode, isValidElement } from "react";

import { e } from "./searchableSelectBem.js";
import { useUiSearchableSelectContext } from "./UiSearchableSelectContext.js";

/**
 * @internal
 */
export interface IUiSearchableSelectFooterProps {
    children: ReactNode;
}

/**
 * @internal
 */
export function UiSearchableSelectFooter({ children }: IUiSearchableSelectFooterProps) {
    const { footerId } = useUiSearchableSelectContext();

    return (
        <div id={footerId} className={e("footer")}>
            {children}
        </div>
    );
}

export function hasUiSearchableSelectFooter(children: ReactNode): boolean {
    return Children.toArray(children).some(
        (child) =>
            isValidElement<{ children?: ReactNode }>(child) &&
            (child.type === UiSearchableSelectFooter ||
                (child.type === Fragment && hasUiSearchableSelectFooter(child.props.children))),
    );
}
