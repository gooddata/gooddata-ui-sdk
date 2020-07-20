// (C) 2019 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import Button from "@gooddata/goodstrap/lib/Button/Button";

interface IDateFilterBodyButtonProps {
    onClick: () => void;
    messageId: string;
    className: string;
    disabled?: boolean;
}

const DateFilterBodyButtonComponent: React.FC<IDateFilterBodyButtonProps & WrappedComponentProps> = (
    props,
) => (
    <Button
        type="button"
        value={props.intl.formatMessage({ id: props.messageId })}
        className={props.className}
        disabled={props.disabled}
        onClick={props.onClick}
    />
);

export const DateFilterBodyButton = injectIntl(DateFilterBodyButtonComponent);
