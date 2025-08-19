// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { messages } from "../../locales.js";
import { getTranslation } from "../utils/translations.js";

export interface IBubbleMessageOwnProps {
    showDisabledMessage: boolean;
    alignPoints?: IAlignPoint[];
    messageId?: string;
    className?: string;
    children?: React.ReactNode;
}

export type IBubbleMessageProps = IBubbleMessageOwnProps & WrappedComponentProps;

export class DisabledBubbleMessage extends React.PureComponent<IBubbleMessageProps> {
    public static defaultProps = {
        alignPoints: [{ align: "cr cl" }],
    };

    public render() {
        const { className, alignPoints, children, intl, messageId = messages.notApplicable.id } = this.props;
        return (
            <BubbleHoverTrigger className={className}>
                {children}
                <Bubble className={this.getBubbleClassNames()} alignPoints={alignPoints}>
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
