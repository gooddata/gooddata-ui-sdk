// (C) 2020-2022 GoodData Corporation
import React, { PureComponent } from "react";
import cx from "classnames";
import { Button } from "../Button/index.js";
import { IDialogBaseProps } from "./typings.js";
import { ENUM_KEY_CODE } from "../typings/utilities.js";
import noop from "lodash/noop.js";

const checkKeyHandler = (event: React.KeyboardEvent, keyCode: number, handler: () => void): void => {
    if (event.keyCode === keyCode && handler) {
        event.preventDefault();
        event.stopPropagation();

        handler();
    }
};

const shouldSubmitOnEnterPress = ({ target }: React.KeyboardEvent): boolean => {
    const { tagName, type } = target as any;
    const tagNameInLowercase = tagName.toLowerCase();
    const typeInLowercase = type ? type.toLowerCase() : "";
    return (
        tagNameInLowercase === "textarea" ||
        (tagNameInLowercase === "input" && (typeInLowercase === "text" || typeInLowercase === "number"))
    );
};

/**
 * @internal
 */
export class DialogBase<P extends IDialogBaseProps> extends PureComponent<P> {
    static defaultProps: Partial<IDialogBaseProps> = {
        children: false,
        className: "",
        displayCloseButton: false,
        submitOnEnterKey: true,
        onCancel: noop,
        onSubmit: noop,
    };

    protected onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void | undefined => {
        const { submitOnEnterKey, onCancel, onSubmit } = this.props;

        // don't call onSubmit when pressing enter key on input fields
        const isEnterKeyDownOnInputField =
            event.keyCode === ENUM_KEY_CODE.KEY_CODE_ENTER && shouldSubmitOnEnterPress(event);
        if (submitOnEnterKey === false && isEnterKeyDownOnInputField) {
            return;
        }

        checkKeyHandler(event, ENUM_KEY_CODE.KEY_CODE_ENTER, onSubmit);
        checkKeyHandler(event, ENUM_KEY_CODE.KEY_CODE_ESCAPE, onCancel);
    };

    protected getDialogClasses(additionalClassName?: string): string {
        return cx("overlay", "gd-dialog", additionalClassName, this.props.className);
    }

    protected renderCloseButton(): JSX.Element {
        return (
            <div className="gd-dialog-close">
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                    value=""
                    onClick={this.props.onClose || this.props.onCancel}
                />
            </div>
        );
    }

    public render(): JSX.Element {
        const dialogClasses = this.getDialogClasses();

        return (
            <div tabIndex={0} onKeyDown={this.onKeyDown}>
                <div className={dialogClasses}>
                    {this.props.displayCloseButton ? this.renderCloseButton() : null}
                    {this.props.children}
                </div>
            </div>
        );
    }
}
