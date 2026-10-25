// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type RenderResult, fireEvent, render } from "@testing-library/react";

import { ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

export function getDialogSubmitButton(wrapper: Element): Element {
    return wrapper.querySelector(".s-dialog-submit-button");
}

export function dialogClickSubmit(wrapper: Element) {
    fireEvent.click(getDialogSubmitButton(wrapper));
}

export function dialogClickCancel(wrapper: Element) {
    fireEvent.click(wrapper.querySelector(".s-dialog-cancel-button"));
}

export function dialogEnterSubmit(wrapper: Element, inputClassName = ".input-text") {
    fireEvent.keyDown(wrapper.querySelector(inputClassName), { key: "Enter", keyCode: 13, which: 13 });
}

export interface IDialogRenderResult extends RenderResult {
    /**
     * Re-renders the very same tree - the dialog keeps its mounted component instances. Use it to
     * replay what the app does when a dialog is hidden and shown again (the selector value changes,
     * the component itself is never unmounted).
     */
    rerenderSame: () => void;
}

export function createRendererFor(
    Dialog: ComponentType,
): (props?: Record<string, unknown> & { intl?: Parameters<typeof withIntl>[1] }) => IDialogRenderResult {
    return (props = {}) => {
        const WrappedComponent = withIntl(
            withRedux(Dialog) as ComponentType<Record<string, unknown>>,
            props.intl,
        );
        const renderElement = () => <WrappedComponent ConfirmDialog={ConfirmDialogBase} {...props} />;
        const result = render(renderElement());
        return { ...result, rerenderSame: () => result.rerender(renderElement()) };
    };
}
