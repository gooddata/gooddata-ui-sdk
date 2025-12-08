// (C) 2007-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";
import { IntlShape, injectIntl } from "react-intl";

import { HeaderWorkspacePickerButton } from "./HeaderWorkspacePickerButton.js";
import { HeaderWorkspacePickerItem } from "./HeaderWorkspacePickerItem.js";
import { Dropdown, DropdownList } from "../Dropdown/index.js";
import { NoData } from "../NoData/index.js";

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

    onOpen?: () => void;
    onSearch?: (searchString: string) => void;
    onSelect?: (item: IHeaderWorkspace) => void;
    onScrollEnd?: (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => void;
    projectPickerFooter?: ReactNode;
    isRenamingProjectToWorkspaceEnabled?: boolean;
}

const renderProjectPickerFooter = (projectPickerFooter?: ReactNode) => {
    const comp = (closeDropdown: () => void) =>
        projectPickerFooter ? (
            <div className="gd-header-project-picker-footer">
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
    onScrollEnd,
    projectPickerFooter,
    className,
    isRenamingProjectToWorkspaceEnabled,
}: IHeaderWorkspacePickerProps) {
    const t = intl.formatMessage;

    const dropdownClassNames = cx({
        "gd-header-project-wrapper": true,
        "gd-header-measure": true,
        [className as string]: !!className,
    });
    const noMatchingWorkspacesId = isRenamingProjectToWorkspaceEnabled
        ? "gs.header.projectPicker.noMatchingWorkspaces"
        : "gs.header.projectPicker.noMatchingProjects";

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
            }}
            renderButton={({ isOpen, toggleDropdown, dropdownId, buttonRef }) => (
                <HeaderWorkspacePickerButton
                    title={selectedWorkspace?.title ?? ""}
                    isOpen={isOpen}
                    onClick={toggleDropdown}
                    dropdownId={dropdownId}
                    buttonRef={buttonRef as any}
                />
            )}
            renderBody={({ closeDropdown, isMobile }) => (
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
                    searchPlaceholder={t({ id: "gs.header.projectPicker.searchPlaceholder" })}
                    searchLabel={t({ id: "gs.header.projectPicker.searchLabel" })}
                    renderNoData={({ hasNoMatchingData }) => (
                        <NoData
                            className="s-noMatchingProjects"
                            noDataLabel={t({ id: "gs.noData.noDataAvailable" })}
                            notFoundLabel={t({ id: noMatchingWorkspacesId })}
                            hasNoMatchingData={hasNoMatchingData}
                        />
                    )}
                    renderItem={({ item }) => {
                        const title = item?.title;
                        const isDemo = item?.isDemo;
                        const isSelected = selectedWorkspace && item && selectedWorkspace.id === item.id;
                        return (
                            <HeaderWorkspacePickerItem
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
                    onScrollEnd={onScrollEnd}
                />
            )}
        />
    );
}
/**
 * @internal
 */
export const HeaderWorkspacePicker = injectIntl(CoreHeaderWorkspacePicker);
