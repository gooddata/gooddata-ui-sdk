// (C) 2019-2026 GoodData Corporation

import { memo, useMemo } from "react";

import cx from "classnames";
import { capitalize } from "lodash-es";
import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    FullScreenOverlay,
    type IAlignPoint,
    type IUiListboxInteractiveItemProps,
    type IUiListboxItem,
    Overlay,
    SingleSelectListItem,
    UiFocusManager,
    UiListbox,
    type UiListboxAriaAttributes,
} from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { MEASURE_VALUE_FILTER_OPERATOR_DROPDOWN_BODY_CLASS } from "./constants.js";
import { getOperatorIcon, getOperatorTranslationKey } from "./helpers/measureValueFilterOperator.js";
import { type MeasureValueFilterOperator } from "./types.js";

interface IOperatorDropdownBodyProps {
    selectedOperator: MeasureValueFilterOperator;
    onSelect: (operator: MeasureValueFilterOperator) => void;
    onClose: () => void;
    alignTo: string;
    /** id of the listbox, referenced by the trigger button's aria-controls. */
    listboxId: string;
    /** id of the visible "Condition" label, used as the listbox accessible name. */
    labelId?: string;
    isAllOperatorDisabled?: boolean;
    isMobile?: boolean;
    isViewMode?: boolean;
}

const MOBILE_DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [{ align: "tl tl" }];
const DISABLED_BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "cr cl" }, { align: "cl cr" }];

const DESKTOP_LISTBOX_MAX_HEIGHT = 350;

// Operators grouped as they appear in the picker; a separator is rendered between groups
// (desktop only — mobile rows already carry a bottom divider).
const OPERATOR_GROUPS: MeasureValueFilterOperator[][] = [
    ["ALL"],
    ["GREATER_THAN", "GREATER_THAN_OR_EQUAL_TO"],
    ["LESS_THAN", "LESS_THAN_OR_EQUAL_TO"],
    ["BETWEEN", "NOT_BETWEEN"],
    ["EQUAL_TO", "NOT_EQUAL_TO"],
];

// Operators that surface an explanatory hover bubble next to their label.
// Declared via `defineMessages` so static i18n analysis (e.g. i18n-toolkit) sees these IDs
// as referenced and validates their presence in translation bundles — a plain `string` map
// is invisible to the extractor because it never reaches an `intl.formatMessage({ id })` call site.
const bubbleMessages = defineMessages({
    BETWEEN: { id: "mvf.operator.between.tooltip.bubble" },
    NOT_BETWEEN: { id: "mvf.operator.notBetween.tooltip.bubble" },
});

const OPERATOR_BUBBLE_MESSAGES: Partial<Record<MeasureValueFilterOperator, MessageDescriptor>> = {
    BETWEEN: bubbleMessages.BETWEEN,
    NOT_BETWEEN: bubbleMessages.NOT_BETWEEN,
};

interface IOperatorItemData {
    operator: MeasureValueFilterOperator;
    iconClass?: string;
    bubbleText?: string;
    disabledTooltip?: string;
}

/**
 * Renders a single operator as an accessible listbox option (role="option" is supplied by
 * the enclosing {@link UiListbox}). Preserves the legacy `s-mvf-operator-*` hooks, the operator
 * icon, the explanatory bubble for range operators and the disabled-state tooltip. The icon and
 * info bubble are handled by SingleSelectListItem's built-in renderers (which also apply
 * `aria-hidden` to the decorative icon).
 */
function OperatorListItem({
    item,
    isSelected,
    isFocused,
    onSelect,
}: IUiListboxInteractiveItemProps<IOperatorItemData>) {
    const { operator, iconClass, bubbleText, disabledTooltip } = item.data;
    const isDisabled = !!item.isDisabled;

    const listItem = (
        <SingleSelectListItem
            className={cx("gd-list-item-shortened", `s-mvf-operator-${simplifyText(operator)}`, {
                "is-disabled": isDisabled,
            })}
            title={item.stringTitle}
            icon={iconClass}
            info={bubbleText}
            isSelected={isSelected}
            isFocused={isFocused}
            onClick={isDisabled ? undefined : onSelect}
        />
    );

    if (isDisabled && disabledTooltip) {
        return (
            <BubbleHoverTrigger tagName={"div"} showDelay={400} hideDelay={200}>
                {listItem}
                <Bubble className="bubble-primary" alignPoints={DISABLED_BUBBLE_ALIGN_POINTS}>
                    {disabledTooltip}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    return listItem;
}

function OperatorSeparatorItem() {
    return <SingleSelectListItem type="separator" accessibilityConfig={{ role: "separator" }} />;
}

export const OperatorDropdownBody = memo(function OperatorDropdownBody({
    onSelect,
    onClose,
    selectedOperator,
    alignTo,
    listboxId,
    labelId,
    isAllOperatorDisabled = false,
    isMobile = false,
    isViewMode = false,
}: IOperatorDropdownBodyProps) {
    const intl = useIntl();

    const allOperatorDisabledTooltip = isAllOperatorDisabled
        ? intl.formatMessage({ id: "mvf.operator.all.disabled.tooltip" })
        : undefined;

    const selectedOperatorTranslationKey = getOperatorTranslationKey(selectedOperator);
    const selectedOperatorTitle = capitalize(
        selectedOperatorTranslationKey === undefined
            ? selectedOperator
            : intl.formatMessage({ id: selectedOperatorTranslationKey }),
    );

    const items = useMemo<IUiListboxItem<IOperatorItemData, null>[]>(() => {
        const result: IUiListboxItem<IOperatorItemData, null>[] = [];

        OPERATOR_GROUPS.forEach((group, groupIdx) => {
            if (groupIdx > 0 && !isMobile) {
                result.push({
                    type: "static",
                    id: `mvf-operator-separator-${groupIdx}`,
                    data: null,
                });
            }

            group.forEach((operator) => {
                const translationKey = getOperatorTranslationKey(operator);
                const title =
                    translationKey === undefined ? operator : intl.formatMessage({ id: translationKey });
                const bubbleMessage = OPERATOR_BUBBLE_MESSAGES[operator];
                const isDisabled = operator === "ALL" ? isAllOperatorDisabled : false;

                result.push({
                    type: "interactive",
                    id: operator,
                    stringTitle: capitalize(title),
                    isDisabled,
                    data: {
                        operator,
                        iconClass: isMobile ? undefined : `gd-icon-${getOperatorIcon(operator)}`,
                        bubbleText:
                            bubbleMessage && !isMobile && !isViewMode
                                ? intl.formatMessage(bubbleMessage)
                                : undefined,
                        disabledTooltip: isDisabled ? allOperatorDisabledTooltip : undefined,
                    },
                });
            });
        });

        return result;
    }, [allOperatorDisabledTooltip, intl, isAllOperatorDisabled, isMobile, isViewMode]);

    const ariaAttributes: UiListboxAriaAttributes = {
        id: listboxId,
        "aria-labelledby": labelId,
    };

    const body = (
        // Focus moves into the listbox on open and returns to the trigger on close, while Tab
        // stays inside the popup — matching the listbox APG pattern used by the text filter.
        <UiFocusManager enableFocusTrap enableAutofocus enableReturnFocusOnUnmount>
            <div
                className={cx(
                    MEASURE_VALUE_FILTER_OPERATOR_DROPDOWN_BODY_CLASS,
                    "s-mvf-operator-dropdown-body",
                    { "gd-is-mobile": isMobile },
                )}
            >
                <UiListbox<IOperatorItemData, null>
                    shouldKeyboardActionPreventDefault
                    shouldKeyboardActionStopPropagation
                    isDisabledFocusable
                    maxHeight={isMobile ? undefined : DESKTOP_LISTBOX_MAX_HEIGHT}
                    dataTestId="mvf-operator-dropdown-body"
                    // Put the per-operator testid on the role="option" <li> (which carries
                    // aria-disabled) rather than the inner item, so disabled-state assertions read
                    // the attribute off the element that actually exposes it.
                    itemDataTestId={(item) =>
                        item.type === "interactive"
                            ? `mvf-operator-${simplifyText(item.data.operator)}`
                            : undefined
                    }
                    items={items}
                    selectedItemId={selectedOperator}
                    onSelect={(item) => onSelect(item.data.operator)}
                    onClose={onClose}
                    ariaAttributes={ariaAttributes}
                    InteractiveItemComponent={OperatorListItem}
                    StaticItemComponent={OperatorSeparatorItem}
                />
            </div>
        </UiFocusManager>
    );

    if (isMobile) {
        return (
            <FullScreenOverlay alignTo="body" alignPoints={MOBILE_DROPDOWN_ALIGN_POINTS} onClose={onClose}>
                <div className="gd-mobile-dropdown-overlay overlay gd-flex-row-container gd-mvf-mobile-dropdown">
                    <div className="gd-mobile-dropdown-header gd-flex-item gd-mvf-mobile-dropdown-header">
                        <button
                            type="button"
                            className="gd-mvf-operator-mobile-header s-mvf-operator-mobile-header"
                            onClick={onClose}
                        >
                            <span className="gd-mvf-operator-mobile-header__label">
                                {intl.formatMessage({ id: "mvf.condition" })}
                            </span>
                            <span className="gd-mvf-operator-mobile-header__value">
                                {selectedOperatorTitle}
                            </span>
                            <span className="gd-mvf-operator-mobile-header__chevron gd-icon-navigateup" />
                        </button>
                    </div>
                    <div className="gd-mobile-dropdown-content gd-flex-item-stretch gd-mvf-mobile-dropdown-content">
                        {body}
                    </div>
                </div>
            </FullScreenOverlay>
        );
    }

    return (
        <Overlay closeOnOutsideClick alignTo={alignTo} alignPoints={[{ align: "bl tl" }]} onClose={onClose}>
            <div className="gd-dropdown overlay">{body}</div>
        </Overlay>
    );
});
