// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { getTranslation } from "../utils/translations.js";
import { messages } from "../../locales.js";

export interface IBubbleMessageOwnProps {
    showDisabledMessage: boolean;
    messageId?: string;
    className?: string;
    children?: React.ReactNode;
}

export type IBubbleMessageProps = IBubbleMessageOwnProps & WrappedComponentProps;

export class DisabledBubbleMessage extends React.PureComponent<IBubbleMessageProps> {
    public render() {
        const { className, children, intl, messageId = messages.notApplicable.id } = this.props;
        return (
            <BubbleHoverTrigger className={className}>
                {children}
                <Bubble className={this.getBubbleClassNames()} alignPoints={[{ align: "cr cl" }]}>
                    {getTranslation(messageId, intl)}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    private getBubbleClassNames(): string {
        return cx("bubble-primary", {
            invisible: !this.props.showDisabledMessage,
        });
    }
}

export default injectIntl<"intl", IBubbleMessageProps>(DisabledBubbleMessage);
