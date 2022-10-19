// (C) 2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { Button } from "../../Button";
import { useIntl } from "react-intl";
import { IDialogBaseProps } from "../typings";
import { LoadingSpinner } from "../../LoadingSpinner";
import { Bubble, BubbleHoverTrigger } from "../../Bubble";
import { Hyperlink } from "../../Hyperlink";
import { Footer } from "../Footer";
import { FooterButtons } from "../FooterButtons";

/**
 * @internal
 */
export interface IStylingEditorDialogFooterProps extends IDialogBaseProps {
    link: {
        text: string;
        url: string;
    };
    disableSubmit?: boolean;
    showProgressIndicator?: boolean;
    errorMessage?: string;
    onHelpClick?: () => void;
}

/**
 * @internal
 */
export const StylingEditorDialogFooter = (props: IStylingEditorDialogFooterProps) => {
    const {
        link,
        disableSubmit = false,
        showProgressIndicator = false,
        errorMessage,
        onSubmit,
        onCancel,
        onHelpClick = noop,
    } = props;
    const intl = useIntl();

    return (
        <Footer>
            <Hyperlink
                text={link.text}
                href={link.url}
                onClick={() => onHelpClick()}
                iconClass={"gd-icon-circle-question"}
            />
            <FooterButtons>
                {showProgressIndicator ? (
                    <LoadingSpinner className="gd-loading-equalizer-spinner small s-gd-styling-editor-spinner" />
                ) : null}
                <Button
                    className="gd-button-secondary s-dialog-cancel-button"
                    value={intl.formatMessage({ id: "cancel" })}
                    onClick={() => onCancel()}
                />
                <BubbleHoverTrigger className="gd-button" showDelay={0} hideDelay={0}>
                    <Button
                        className="gd-button-action s-dialog-submit-button"
                        value={intl.formatMessage({ id: "save" })}
                        onClick={() => onSubmit()}
                        disabled={disableSubmit}
                    />
                    {errorMessage && disableSubmit ? (
                        <Bubble className="bubble-negative" alignPoints={[{ align: "tc br" }]}>
                            {errorMessage}
                        </Bubble>
                    ) : null}
                </BubbleHoverTrigger>
            </FooterButtons>
        </Footer>
    );
};
