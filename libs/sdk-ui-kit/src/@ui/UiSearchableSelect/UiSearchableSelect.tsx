// (C) 2026 GoodData Corporation

import { Children, Fragment, type ReactNode, isValidElement, useId, useRef, useState } from "react";

import { useMediaQuery } from "../../responsive/useMediaQuery.js";
import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { matchesSearchQuery } from "../@utils/matchesSearchQuery.js";
import { type IUiDropdownButtonRenderProps } from "../UiDropdown/types.js";
import { UiDropdown } from "../UiDropdown/UiDropdown.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { getUiListboxItemFullTitle } from "../UiListbox/itemTitle.js";
import { type IUiListboxInteractiveItem, type IUiListboxItem } from "../UiListbox/types.js";
import { getNextFocusableItemId } from "../UiListbox/UiListbox.js";
import { UiDialogHeader } from "../UiModalDialog/UiDialogHeader.js";
import { UiModalDialog } from "../UiModalDialog/UiModalDialog.js";

import { e } from "./searchableSelectBem.js";
import { UiSearchableSelectContext } from "./UiSearchableSelectContext.js";
import { UiSearchableSelectDivider } from "./UiSearchableSelectDivider.js";
import { hasUiSearchableSelectFooter } from "./UiSearchableSelectFooter.js";
import { getUiSearchableSelectItemDescriptor } from "./UiSearchableSelectItem.js";
import { findUiSearchableSelectListRenderItem } from "./UiSearchableSelectList.js";

/**
 * @internal
 */
export interface IUiSearchableSelectProps<T> {
    accessibilityConfig: IAccessibilityConfigBase;
    children: ReactNode;
    /**
     * Whether the dropdown is open when it mounts (uncontrolled, like `defaultOpen` in React Aria).
     * Defaults to `false`.
     */
    defaultOpen?: boolean;
    /**
     * Whether an item matches the search query. Defaults to the item's title containing the query. Called only
     * while searching: without a query, all items show.
     */
    filter?: (item: T, query: string) => boolean;
    isOpen?: boolean;
    items: T[];
    onChange: (value: string) => void;
    onOpenChange?: (isOpen: boolean) => void;
    placeholder: string;
    /**
     * Only null for now as proper custom anchor is not needed. Null is supported only in fullscreen mode as
     * desktop mode would for that need `anchorRef` prop or something similar which is not needed.
     * You can extend this if you find the need for any of those in the future.
     */
    renderButton?: null;
    shouldCloseOnSelect?: boolean;
    /**
     * The heading of the full-screen view on mobile, which also names its dialog.
     */
    title: string;
    value: string | null;
}

/**
 * @internal
 */
export function UiSearchableSelect<T>({
    accessibilityConfig,
    children,
    items,
    filter,
    placeholder,
    title,
    defaultOpen = false,
    isOpen,
    onOpenChange,
    renderButton: renderButtonProp,
    shouldCloseOnSelect = true,
    value,
    onChange,
}: IUiSearchableSelectProps<T>) {
    const isFullscreen = useMediaQuery("mobileDevice");
    const [isOpenState, setIsOpenState] = useState(defaultOpen);
    const isOpenResolved = isOpen ?? isOpenState;
    const setIsOpen = (nextIsOpen: boolean) => {
        setIsOpenState(nextIsOpen);
        onOpenChange?.(nextIsOpen);
    };
    const dialogId = useId();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const buttonId = useId();
    const valueId = useId();
    const listboxId = useId();
    const footerId = useId();
    const [query, setQuery] = useState("");

    const renderItem = findUiSearchableSelectListRenderItem(children);
    // one group per item: the item and the dividers rendered with it
    const listboxItemGroups = items.map((item): IUiListboxItem<T>[] =>
        renderItem ? getListboxItems(renderItem(item), item) : [],
    );
    const selectedItem = listboxItemGroups
        .flat()
        .find(
            (item): item is IUiListboxInteractiveItem<T> => item.type === "interactive" && item.id === value,
        );
    const filterListboxItems = (searchQuery: string) =>
        listboxItemGroups
            .filter(
                (group) =>
                    !searchQuery ||
                    group.some(
                        (item) =>
                            item.type === "interactive" &&
                            (filter
                                ? filter(item.data, searchQuery)
                                : matchesSearchQuery(item.stringTitle, searchQuery)),
                    ),
            )
            .flat();
    const filteredListboxItems = filterListboxItems(query);
    const [focusedItemId, setFocusedItemId] = useState(value);
    const [isActiveDescendantShown, setIsActiveDescendantShown] = useState(false);
    const changeQuery = (nextQuery: string) => {
        setQuery(nextQuery);
        setFocusedItemId(
            nextQuery
                ? getNextFocusableItemId({
                      items: filterListboxItems(nextQuery),
                      focusedItemId: null,
                      direction: "down",
                  })
                : value,
        );
    };

    const [wasOpen, setWasOpen] = useState(isOpenResolved);
    if (wasOpen !== isOpenResolved) {
        setWasOpen(isOpenResolved);
        if (isOpenResolved) {
            setFocusedItemId(value);
            setIsActiveDescendantShown(false);
        } else {
            setQuery("");
        }
    }

    const renderButton = ({
        isOpen,
        onClick,
        ariaAttributes,
        ref,
    }: {
        isOpen: boolean;
        onClick: () => void;
        ariaAttributes: IUiDropdownButtonRenderProps["ariaAttributes"];
        ref?: IUiDropdownButtonRenderProps["ref"];
    }) => (
        <button
            className={e("button")}
            // UiDropdown types its ref as RefObject<HTMLElement>, which a <button> doesn't accept;
            // a callback ref assigns the mounted button to it without a cast
            ref={(button) => {
                if (button && ref) {
                    ref.current = button;
                }
            }}
            type="button"
            onClick={onClick}
            {...ariaAttributes}
            {...accessibilityConfigToAttributes(accessibilityConfig)}
            id={buttonId}
            // Normally if both aria-label and button text is applied, the screen reader announces only the label. Make sure that is not the case.
            aria-labelledby={`${valueId} ${accessibilityConfig.ariaLabelledBy ?? buttonId}`}
        >
            <span id={valueId} className={e("button-title")}>
                {selectedItem ? getUiListboxItemFullTitle(selectedItem) : placeholder}
            </span>
            <div className={e("button-icon")}>
                <UiIcon type={isOpen ? "navigateUp" : "navigateDown"} size={14} disableAnimation />
            </div>
        </button>
    );

    const renderBody = (closeDropdown: () => void, bodyAttributes?: { id: string }) => (
        <UiSearchableSelectContext.Provider
            value={{
                listboxItems: filteredListboxItems,
                query,
                setQuery: changeQuery,
                listboxLabelledBy:
                    accessibilityConfig.ariaLabelledBy ??
                    (isFullscreen && renderButtonProp === null ? undefined : buttonId),
                listboxLabel: accessibilityConfig.ariaLabel,
                listboxId,
                focusedItemId,
                setFocusedItemId,
                isActiveDescendantShown,
                setIsActiveDescendantShown,
                value,
                onChange,
                closeDropdown,
                shouldCloseOnSelect,
                searchInputRef,
                isFullscreen,
                footerId: hasUiSearchableSelectFooter(children) ? footerId : undefined,
            }}
        >
            <div className={e("body", { isFullscreen })} {...bodyAttributes}>
                {children}
            </div>
        </UiSearchableSelectContext.Provider>
    );

    if (isFullscreen) {
        const closeFullscreen = () => setIsOpen(false);

        return (
            <>
                {renderButtonProp === null
                    ? null
                    : renderButton({
                          isOpen: isOpenResolved,
                          onClick: () => setIsOpen(true),
                          ariaAttributes: {
                              role: "button",
                              "aria-haspopup": "dialog",
                              "aria-expanded": isOpenResolved,
                              // The dialog is rendered only while open, so the button points at it only then
                              "aria-controls": isOpenResolved ? dialogId : undefined,
                          },
                      })}
                <UiModalDialog
                    id={dialogId}
                    isFullscreen
                    isOpen={isOpenResolved}
                    onClose={closeFullscreen}
                    initialFocus={searchInputRef}
                >
                    <UiDialogHeader title={title} onClose={closeFullscreen} />
                    {renderBody(closeFullscreen)}
                </UiModalDialog>
            </>
        );
    }

    return (
        <UiDropdown
            width="same-as-anchor"
            fullWidthButton
            autofocusOnOpen
            enableFocusTrap={false}
            returnFocusTo={buttonId}
            isOpen={isOpenResolved}
            onOpenChange={setIsOpen}
            accessibilityConfig={{ popupRole: "listbox" }}
            renderButton={({ ref, isOpen, toggleDropdown, ariaAttributes }) =>
                renderButton({
                    isOpen,
                    onClick: toggleDropdown,
                    ref,
                    ariaAttributes: {
                        ...ariaAttributes,
                        "aria-controls": isOpen ? listboxId : undefined,
                    },
                })
            }
            renderBody={({ ariaAttributes, closeDropdown }) => renderBody(closeDropdown, ariaAttributes)}
        />
    );
}

/**
 * Reads what the item render function returned: an item alone, or an item in a fragment with dividers
 * (`<><UiSearchableSelectItem … /><UiSearchableSelectDivider /></>`), in the order they were written.
 */
function getListboxItems<T>(node: ReactNode, data: T): IUiListboxItem<T>[] {
    const nodes =
        isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment
            ? Children.toArray(node.props.children)
            : [node];
    const listboxItems = nodes.flatMap((child): IUiListboxItem<T>[] => {
        const descriptor = getUiSearchableSelectItemDescriptor(child);
        if (descriptor) {
            return [{ type: "interactive", ...descriptor, data }];
        }
        return isValidElement(child) && child.type === UiSearchableSelectDivider
            ? [{ type: "separator" }]
            : [];
    });

    // dividers belong to an item, so without exactly one item there is nothing to show
    return listboxItems.filter((item) => item.type === "interactive").length === 1 ? listboxItems : [];
}
