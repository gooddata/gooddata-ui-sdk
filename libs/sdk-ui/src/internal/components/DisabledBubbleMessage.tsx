// (C) 2019 GoodData Corporation
import * as React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import * as classNames from "classnames";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import { getTranslation } from "../utils/translations";

export interface IBubbleMessageProps {
    showDisabledMessage: boolean;
    className?: string;
}

export class DisabledBubbleMessage extends React.PureComponent<IBubbleMessageProps & WrappedComponentProps> {
    public render() {
        const { className, children, intl } = this.props;
        return (
            <BubbleHoverTrigger className={className}>
                {children}
                <Bubble className={this.getBubbleClassNames()} alignPoints={[{ align: "cr cl" }]}>
                    {getTranslation("properties.not_applicable", intl)}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    private getBubbleClassNames() {
        return classNames("bubble-primary", {
            invisible: !this.props.showDisabledMessage,
        });
    }
}

export default injectIntl(DisabledBubbleMessage);
