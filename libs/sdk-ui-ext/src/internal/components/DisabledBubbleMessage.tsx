// (C) 2019-2025 GoodData Corporation

import { type ReactNode, memo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { messages } from "../../locales.js";
import { getTranslation } from "../utils/translations.js";

export interface IBubbleMessageOwnProps {
    showDisabledMessage: boolean;
    alignPoints?: IAlignPoint[];
    messageId?: string;
    className?: string;
    children?: ReactNode;
}

export type IBubbleMessageProps = IBubbleMessageOwnProps;

export const DisabledBubbleMessage = memo(function DisabledBubbleMessage({
    className,
    alignPoints = [{ align: "cr cl" }],
    children,
    messageId = messages["notApplicable"].id,
    showDisabledMessage,
}: IBubbleMessageProps) {
    const intl = useIntl();

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
