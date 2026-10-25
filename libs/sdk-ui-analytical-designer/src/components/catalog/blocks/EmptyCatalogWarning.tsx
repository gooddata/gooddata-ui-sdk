// (C) 2019-2026 GoodData Corporation

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

import { TabNames } from "../model/catalogFilter.js";

export interface IEmptyCatalogWarningOwnProps {
    selectedTabNames: string;
    hiddenItemsCount: number;
    isWorkspaceEmpty: boolean;
    canManageProject: boolean;
    isFreemiumEdition: boolean;
    linkToDatasourcePage: string;
}

const getMessageId = (
    filterName: string,
    hiddenItemsCount: number,
    isWorkspaceEmpty: boolean,
    canManageProject: boolean,
) => {
    if (isWorkspaceEmpty && canManageProject) {
        return defineMessage({ id: "catalog.workspace_contains_no_data" }).id;
    }

    if (hiddenItemsCount > 0) {
        if (filterName === (TabNames.ALL_TAB_NAME as string)) {
            return defineMessage({ id: "catalog.no_related_data_items_found" }).id;
        }

        if (filterName === (TabNames.MEASURES_TAB_NAME as string)) {
            return defineMessage({ id: "catalog.no_related_measures_found" }).id;
        }
        if (filterName === (TabNames.ATTRIBUTES_TAB_NAME as string)) {
            return defineMessage({ id: "catalog.no_related_attributes_found" }).id;
        }
        return defineMessage({ id: "catalog.no_related_data_items_found" }).id;
    }

    if (filterName === (TabNames.ALL_TAB_NAME as string)) {
        return defineMessage({ id: "catalog.no_data_items_available" }).id;
    }

    if (filterName === (TabNames.MEASURES_TAB_NAME as string)) {
        return defineMessage({ id: "catalog.no_measures_available" }).id;
    }
    if (filterName === (TabNames.ATTRIBUTES_TAB_NAME as string)) {
        return defineMessage({ id: "catalog.no_attributes_available" }).id;
    }
    return defineMessage({ id: "catalog.no_data_items_available" }).id;
};

export function EmptyCatalogWarning({
    selectedTabNames,
    hiddenItemsCount,
    isWorkspaceEmpty,
    canManageProject,
    isFreemiumEdition,
    linkToDatasourcePage,
}: IEmptyCatalogWarningOwnProps) {
    const messageId = getMessageId(selectedTabNames, hiddenItemsCount, isWorkspaceEmpty, canManageProject);
    const className = classNames("adi-no-objects", "s-no-objects-found", {
        "adi-no-objects-empty-workspace": isWorkspaceEmpty && canManageProject,
    });

    return (
        <div className={className}>
            <FormattedMessage id={messageId} />
            {isFreemiumEdition && canManageProject && isWorkspaceEmpty ? (
                <>
                    {" "}
                    <a
                        href={linkToDatasourcePage}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="s-catalog-no-data-link"
                    >
                        <FormattedMessage id="catalog.workspace_contains_no_data.link" />
                    </a>
                </>
            ) : null}
        </div>
    );
}
