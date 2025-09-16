// (C) 2022-2025 GoodData Corporation

import noop from "lodash/noop.js";
import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "../../Bubble/index.js";
import { Button } from "../../Button/index.js";
import { Hyperlink } from "../../Hyperlink/index.js";
import { LoadingSpinner } from "../../LoadingSpinner/index.js";
import { Footer } from "../Footer.js";
import { FooterButtons } from "../FooterButtons.js";
import { IDialogBaseProps } from "../typings.js";

/**
 * @internal
 */
export type TStylingEditorDialogFooterProps = {
    link: {
        text: string;
        url: string;
    };
    disableSubmit?: boolean;
    showProgressIndicator?: boolean;
    errorMessage?: string;
    onHelpClick?: () => void;
} & Pick<IDialogBaseProps, "onCancel" | "onSubmit">;

/**
 * @internal
 */
export function StylingEditorDialogFooter(props: TStylingEditorDialogFooterProps) {
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
}
