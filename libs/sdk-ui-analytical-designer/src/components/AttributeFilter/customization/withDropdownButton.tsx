// (C) 2007-2026 GoodData Corporation

import { type ComponentType, type ReactElement } from "react";

import cx from "classnames";

import {
    AttributeFilterDropdownButton,
    type IAttributeFilterDropdownButtonProps,
    useAutoOpenAttributeFilterDropdownButton,
    useOnCloseAttributeFilterDropdownButton,
} from "@gooddata/sdk-ui-filters";
import { Bubble, BubbleHoverTrigger, IconAttribute } from "@gooddata/sdk-ui-kit";

function WarningIcon() {
    return (
        <span className="adi-attribute-filter-warning-icon">
            <span />
        </span>
    );
}

interface IWrapWithWarningBubbleProps {
    button: ReactElement;
    message: string;
    isOpen: boolean;
}

function WrapWithWarningBubble({ button, message, isOpen }: IWrapWithWarningBubbleProps) {
    if (isOpen) {
        return button;
    }

    return (
        <BubbleHoverTrigger tagName={"div"} showDelay={200} hideDelay={0}>
            {button}
            <Bubble alignPoints={[{ align: "bc tc" }]}>{message}</Bubble>
        </BubbleHoverTrigger>
    );
}

/**
 * This function customize AttributeFilterDropdownButton icons and draggable
 * It also simulate autoOpen dropdown filter and missing onClose AttributeFilter callback.
 * Base on isUsedByInsight it add warnings icons and warning message.
 */
export function withDropdownButton(
    isUsedByInsight: boolean,
    isAutoOpen: boolean,
    warningMessage: string,
    onClose: () => void,
    ButtonComponent: ComponentType<IAttributeFilterDropdownButtonProps>,
) {
    function Component(props: IAttributeFilterDropdownButtonProps) {
        const { isOpen, isError } = props;
        const className = "s-filter-button adi-attribute-filter-button";
        useAutoOpenAttributeFilterDropdownButton(props, isAutoOpen);
        useOnCloseAttributeFilterDropdownButton(props, onClose);
        const isWarningAttribute = !(isUsedByInsight || isError);

        if (ButtonComponent) {
            return (
                <div className={className}>
                    <ButtonComponent {...props} />
                </div>
            );
        }

        return (
            <div
                className={cx(className, {
                    "adi-attribute-filter-button-warning": isWarningAttribute,
                    "s-filter-warning": isWarningAttribute,
                })}
            >
                {isWarningAttribute ? (
                    <WrapWithWarningBubble
                        button={
                            <AttributeFilterDropdownButton {...props} isDraggable icon={<WarningIcon />} />
                        }
                        message={warningMessage}
                        isOpen={isOpen}
                    />
                ) : (
                    <AttributeFilterDropdownButton {...props} isDraggable icon={<IconAttribute />} />
                )}
            </div>
        );
    }

    return Component;
}
