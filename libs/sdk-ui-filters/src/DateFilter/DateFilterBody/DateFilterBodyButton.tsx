// (C) 2019-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

interface IDateFilterBodyButtonProps {
    onClick: () => void;
    messageId: string;
    className: string;
    disabled?: boolean;
    describedByFromValidation?: boolean;
}

export function DateFilterBodyButton({
    messageId,
    className,
    disabled,
    onClick,
    describedByFromValidation,
}: IDateFilterBodyButtonProps) {
    const intl = useIntl();

    return (
        <Button
            type="button"
            value={intl.formatMessage({ id: messageId })}
            className={className}
            disabled={disabled}
            onClick={onClick}
            describedByFromValidation={describedByFromValidation}
        />
    );
}
