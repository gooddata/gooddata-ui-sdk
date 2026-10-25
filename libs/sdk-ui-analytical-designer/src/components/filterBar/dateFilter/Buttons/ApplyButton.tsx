// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

export interface IApplyButtonProps {
    onClick: () => void;
    tooltip?: string;
    isEnabled: boolean;
}

function WrappedButton({ onClick, tooltip, isEnabled }: IApplyButtonProps) {
    const intl = useIntl();
    const text = intl.formatMessage({ id: "apply" });
    return (
        <Button
            className="gd-button-action gd-button-small s-date-filter-apply"
            onClick={onClick}
            value={text}
            title={tooltip ? null : text}
            disabled={!isEnabled}
        />
    );
}

export function ApplyButton(props: IApplyButtonProps) {
    const { tooltip } = props;
    if (tooltip === undefined) {
        return <WrappedButton {...props} />;
    }
    return (
        <BubbleHoverTrigger>
            <WrappedButton {...props} />
            <Bubble
                className="bubble-primary s-date-filter-apply-button-bubble"
                alignPoints={[{ align: "tc bl" }]}
            >
                {tooltip}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
