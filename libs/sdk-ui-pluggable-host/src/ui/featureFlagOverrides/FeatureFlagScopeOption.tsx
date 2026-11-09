// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIntl } from "react-intl";

import {
    type IUiListboxInteractiveItemProps,
    UiIcon,
    UiTooltip,
    bem,
    useIsTextTruncated,
} from "@gooddata/sdk-ui-kit";

import { e } from "./featureFlagOverridesBem.js";
import { type OverrideScope } from "./overrideRules.js";

const listbox = bem("gd-ui-kit-listbox");

// Same as the kit's default item: the tooltip anchor wrapper must let the title shrink and clip.
const TITLE_ANCHOR_STYLE = { display: "block", minWidth: 0, flex: "1 1 0%" } as const;

export interface IScopeOption {
    scope: OverrideScope;
    place: string;
    name: string | undefined;
}

/**
 * Mirrors the kit's DefaultUiListboxInteractiveItemComponent, with the place name as a muted
 * second span that truncates on its own.
 */
export function FeatureFlagScopeOption({
    item,
    isFocused,
    isSelected,
    isCompact,
    onSelect,
}: IUiListboxInteractiveItemProps<IScopeOption>): ReactNode {
    const intl = useIntl();
    const { place, name } = item.data;
    const nameText = useIsTextTruncated(name ?? "");
    const label = (chunks: ReactNode) => <span className={e("option-label")}>{chunks}</span>;
    const titleElement = (
        <span className={`${listbox.e("item-title")} ${e("option-title")}`}>
            {name === undefined
                ? label(place)
                : intl.formatMessage(
                      { id: "featureFlagOverrides.scope.option" },
                      {
                          place,
                          name,
                          label,
                          muted: (chunks: ReactNode) => (
                              <span ref={nameText.ref} className={e("option-name")}>
                                  {chunks}
                              </span>
                          ),
                      },
                  )}
        </span>
    );

    return (
        <div
            className={listbox.e("item", { isFocused, isSelected, isCompact, isDisabled: !!item.isDisabled })}
            onClick={item.isDisabled ? undefined : onSelect}
        >
            {nameText.isTruncated ? (
                <UiTooltip
                    anchor={titleElement}
                    content={item.stringTitle}
                    triggerBy={["hover"]}
                    accessibilityHidden
                    arrowPlacement="left"
                    optimalPlacement
                    offset={10}
                    component="span"
                    anchorWrapperStyles={TITLE_ANCHOR_STYLE}
                />
            ) : (
                titleElement
            )}
            {item.tooltip ? (
                <>
                    <UiTooltip
                        anchor={
                            <div className={listbox.e("item-explanation")}>
                                <UiIcon type="question" size={14} color="complementary-7" />
                            </div>
                        }
                        content={item.tooltipContent ?? item.tooltip}
                        triggerBy={["hover"]}
                        accessibilityHidden
                        arrowPlacement="left"
                        optimalPlacement
                        width={200}
                        offset={10}
                    />
                    {/* the option is never DOM-focused (the listbox drives aria-activedescendant),
                        so the tooltip text rides along inside the option's content for screen
                        readers instead of a describedby/focusable-anchor wiring */}
                    <span className="sr-only">{item.tooltip}</span>
                </>
            ) : null}
        </div>
    );
}
