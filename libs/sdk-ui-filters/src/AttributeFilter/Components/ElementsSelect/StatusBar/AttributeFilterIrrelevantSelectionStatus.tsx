// (C) 2023-2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useMemo } from "react";

import { FormattedMessage } from "react-intl";

import { type IAttributeElement } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Message } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS = [{ align: "bl tl" }];
const ARROW_OFFSETS = { "bl tl": [-10, 12] };

interface IAttributeFilterIrrelevantSelectionStatusProps {
    parentFilterTitles: string[];
    irrelevantSelection: IAttributeElement[];
    showClearButton?: boolean;
    onClear?: () => void;
}

export function AttributeFilterIrrelevantSelectionStatus({
    parentFilterTitles,
    irrelevantSelection,
    onClear,
    showClearButton = true,
}: IAttributeFilterIrrelevantSelectionStatusProps) {
    const parentFiltersTooltipText = useMemo(() => {
        return parentFilterTitles ? parentFilterTitles.join(", ") : "";
    }, [parentFilterTitles]);

    if (irrelevantSelection.length === 0) {
        return null;
    }

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onClear?.();
    };

    return (
        <Message
            className="gd-attribute-filter-status-irrelevant-message s-attribute-filter-status-irrelevant-message"
            type="warning"
        >
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <FormattedMessage id="attributesDropdown.irrelevantValues" values={{ nbsp: <>&nbsp;</> }} />
                <Bubble
                    className={`bubble-primary gd-attribute-filter-dropdown-bubble__next s-attribute-filter-dropdown-bubble`}
                    alignPoints={ALIGN_POINTS}
                    arrowOffsets={ARROW_OFFSETS}
                >
                    <FormattedMessage
                        id="attributesDropdown.irrelevantValues.tooltip"
                        values={{
                            parents: parentFiltersTooltipText,
                            strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
            {showClearButton ? (
                <button className="gd-action-clear s-action-clear" onClick={handleClick}>
                    <FormattedMessage id="attributesDropdown.irrelevantValues.clear" />
                </button>
            ) : null}
        </Message>
    );
}
