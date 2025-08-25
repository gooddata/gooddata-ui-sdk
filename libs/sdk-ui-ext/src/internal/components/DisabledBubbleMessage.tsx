// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

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

export const DisabledBubbleMessage = memo(function DisabledBubbleMessage({
    className,
    alignPoints = [{ align: "cr cl" }],
    children,
    intl,
    messageId = messages.notApplicable.id,
    showDisabledMessage,
}: IBubbleMessageProps) {
    const getBubbleClassNames = (): string => {
        return cx("bubble-primary", {
            invisible: !showDisabledMessage,
        });
    };

    return (
        <BubbleHoverTrigger className={className}>
            {children}
            <Bubble className={getBubbleClassNames()} alignPoints={alignPoints}>
                {getTranslation(messageId, intl)}
            </Bubble>
        </BubbleHoverTrigger>
    );
});

export default injectIntl<"intl", IBubbleMessageProps>(DisabledBubbleMessage);
