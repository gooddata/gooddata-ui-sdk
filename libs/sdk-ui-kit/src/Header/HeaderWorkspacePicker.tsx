// (C) 2007-2020 GoodData Corporation
import React from "react";
import { injectIntl, IntlShape } from "react-intl";
import get from "lodash/get";
import cx from "classnames";

import { DropdownList, Dropdown, NoData } from "@gooddata/goodstrap/lib/@next";

import { HeaderWorkspacePickerButton } from "./HeaderWorkspacePickerButton";
import { HeaderWorkspacePickerItem } from "./HeaderWorkspacePickerItem";
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
    projectPickerFooter?: React.ReactNode;
}

const renderProjectPickerFooter = (projectPickerFooter?: React.ReactNode) => {
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

export const CoreHeaderWorkspacePicker: React.FC<IHeaderWorkspacePickerProps> = ({
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
}) => {
    const t = intl.formatMessage;

    const dropdownClassNames = cx({
        "gd-header-project-wrapper": true,
        "gd-header-measure": true,
        [className]: !!className,
    });

    return (
        <Dropdown
            className={dropdownClassNames}
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            onOpenStateChanged={(isOpen) => {
                if (isOpen && onOpen) {
                    onOpen();
                }
            }}
            renderButton={({ isOpen, toggleDropdown }) => (
                <HeaderWorkspacePickerButton
                    title={selectedWorkspace && selectedWorkspace.title}
                    isOpen={isOpen}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown, isMobile }) => (
                <>
                    { isMobile || <div className="project-picker-header">{t({ id: "gs.header.projectPicker.workspaces"})}</div>}
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
                        renderNoData={({ hasNoMatchingData }) => (
                            <NoData
                                className="s-noMatchingProjects"
                                noDataLabel={t({ id: "gs.noData.noDataAvailable" })}
                                notFoundLabel={t({ id: "gs.header.projectPicker.noMatchingProjects" })}
                                hasNoMatchingData={hasNoMatchingData}
                            />
                        )}
                        renderItem={({ item }) => {
                            const title = get(item, "title");
                            const isDemo = get(item, "isDemo");
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
                </>
            )}
        />
    );
};
/**
 * @internal
 */
export const HeaderWorkspacePicker = injectIntl(CoreHeaderWorkspacePicker);
