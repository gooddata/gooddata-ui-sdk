// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { type IntlShape, injectIntl } from "react-intl";

import {
    HeaderWorkspacePickerButton,
    type IHeaderWorkspacePickerButtonAccessibilityConfig,
} from "./HeaderWorkspacePickerButton.js";
import { HeaderWorkspacePickerItem } from "./HeaderWorkspacePickerItem.js";
import { UiSkeleton } from "../@ui/UiSkeleton/UiSkeleton.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import { DropdownList } from "../Dropdown/DropdownList.js";
import { NoData } from "../NoData/NoData.js";

/**
 * @internal
 */
export interface IHeaderWorkspace {
    id: string;
    title: string;
    description: string;
    isDemo?: boolean;
}

/**
 * @internal
 */
export interface IHeaderWorkspacePickerProps {
    intl: IntlShape;
    className?: string;

    isLoading?: boolean;

    selectedWorkspace?: IHeaderWorkspace;
    workspaces?: IHeaderWorkspace[];
    totalWorkspacesCount?: number;
    searchString?: string;
    showSearch?: boolean;
    projectPickerFooter?: ReactNode;

    onOpen?: () => void;
    onSearch?: (searchString: string) => void;
    onSelect?: (item: IHeaderWorkspace) => void;
    onOpenStateChanged?: (isOpen: boolean) => void;

    loadNextPage?: () => void;
    hasNextPage?: boolean;
    skeletonItemsCount?: number;
    isNextPageLoading?: boolean;
    shouldLoadNextPage?: (lastItemIndex: number, itemsCount: number, skeletonItemsCount: number) => boolean;
}

const renderProjectPickerFooter = (projectPickerFooter?: ReactNode) => {
    const comp = (closeDropdown: () => void) =>
        projectPickerFooter ? (
            <div
                className="gd-header-project-picker-footer"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        // Find and click the link inside
                        const link = e.currentTarget.querySelector("a");
                        if (link) {
                            link.click();
                        }
                        closeDropdown();
                    }
                }}
            >
                <span onClick={closeDropdown}>{projectPickerFooter}</span>
            </div>
        ) : (
            false
        );
    comp.displayName = "ProjectPickerFooter";
    return comp;
};

function CoreHeaderWorkspacePicker({
    intl,
    isLoading,
    workspaces,
    selectedWorkspace,
    totalWorkspacesCount,
    searchString,
    showSearch,
    onOpen,
    onSelect,
    onSearch,
    projectPickerFooter,
    className,
    onOpenStateChanged,
    //paging props
    loadNextPage,
    hasNextPage,
    skeletonItemsCount,
    isNextPageLoading,
    shouldLoadNextPage,
}: IHeaderWorkspacePickerProps) {
    const dropdownClassNames = cx({
        "gd-header-project-wrapper": true,
        "gd-header-measure": true,
        [className as string]: !!className,
    });

    const selectedWorkspaceTitle = selectedWorkspace?.title || selectedWorkspace?.id || "";

    return (
        <Dropdown
            className={dropdownClassNames}
            closeOnParentScroll
            closeOnMouseDrag
            closeOnEscape
            autofocusOnOpen={!showSearch}
            onOpenStateChanged={(isOpen) => {
                if (isOpen && onOpen) {
                    onOpen();
                }
                if (onOpenStateChanged) {
                    onOpenStateChanged(isOpen);
                }
            }}
            renderButton={({ isOpen, toggleDropdown, buttonRef, accessibilityConfig }) => {
                const config: IHeaderWorkspacePickerButtonAccessibilityConfig = {
                    ...accessibilityConfig,
                    ariaHaspopup: "dialog",
                    popupType: "dialog",
                };

                return (
                    <HeaderWorkspacePickerButton
                        title={selectedWorkspaceTitle}
                        isOpen={isOpen}
                        onClick={toggleDropdown}
                        buttonRef={buttonRef as any}
                        accessibilityConfig={config}
                    />
                );
            }}
            renderBody={({ closeDropdown, isMobile, ariaAttributes }) => (
                <div
                    role="dialog"
                    aria-label={intl.formatMessage({ id: "gs.header.projectPicker.pickerName.aria" })}
                    id={ariaAttributes.id}
                >
                    <DropdownList
                        footer={renderProjectPickerFooter(projectPickerFooter)}
                        closeDropdown={closeDropdown}
                        className="project-picker-dropdown"
                        width={350}
                        isMobile={isMobile}
                        showSearch={showSearch}
                        searchString={searchString}
                        items={workspaces}
                        itemsCount={totalWorkspacesCount}
                        isLoading={isLoading}
                        onSearch={onSearch}
                        searchFieldSize="normal"
                        searchPlaceholder={intl.formatMessage({
                            id: "gs.header.projectPicker.searchPlaceholder.aria",
                        })}
                        searchLabel={intl.formatMessage({
                            id: "gs.header.projectPicker.searchPlaceholder.aria",
                        })}
                        renderNoData={({ hasNoMatchingData }) => (
                            <NoData
                                className="s-noMatchingProjects"
                                noDataLabel={intl.formatMessage({ id: "gs.noData.noDataAvailable" })}
                                notFoundLabel={intl.formatMessage({
                                    id: "gs.header.projectPicker.noMatchingWorkspaces",
                                })}
                                hasNoMatchingData={hasNoMatchingData}
                            />
                        )}
                        renderItem={({ item }) => {
                            const title = item?.title;
                            const isDemo = item?.isDemo;
                            const workspaceId = item?.id;
                            const isSelected = selectedWorkspace?.id === item?.id;
                            return (
                                <HeaderWorkspacePickerItem
                                    workspaceId={workspaceId}
                                    title={title}
                                    isDemo={isDemo}
                                    isSelected={isSelected}
                                    isLoading={!item}
                                    onClick={() => {
                                        if (item && onSelect) {
                                            onSelect(item);
                                            closeDropdown();
                                        }
                                    }}
                                />
                            );
                        }}
                        loadNextPage={loadNextPage}
                        hasNextPage={hasNextPage}
                        skeletonItemsCount={skeletonItemsCount}
                        isNextPageLoading={isNextPageLoading}
                        shouldLoadNextPage={shouldLoadNextPage}
                        SkeletonItem={() => (
                            <UiSkeleton
                                itemWidth={["100%"]}
                                direction="row"
                                itemPadding={15}
                                itemHeight={18}
                                itemsCount={1}
                                itemsGap={0}
                            />
                        )}
                        onKeyDownSelect={(item) => {
                            if (item && onSelect) {
                                onSelect(item);
                                closeDropdown();
                            }
                        }}
                        itemTitleGetter={(item) => item?.title || item?.id || ""}
                        accessibilityConfig={{
                            role: "listbox",
                            ariaLabel: intl.formatMessage({ id: "gs.header.projectPicker.workspaces" }),
                        }}
                    />
                </div>
            )}
        />
    );
}
/**
 * @internal
 */
export const HeaderWorkspacePicker = injectIntl(CoreHeaderWorkspacePicker);
