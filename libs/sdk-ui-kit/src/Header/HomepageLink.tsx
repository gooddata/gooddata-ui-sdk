// (C) 2020-2025 GoodData Corporation

import { type MouseEvent } from "react";

import { FormattedMessage } from "react-intl";

import { WorkspacePickerHomeFooter } from "./WorkspacePickerHomeFooter.js";

const getHomePageHref = () => {
    return "/";
};

/**
 * @internal
 */
export interface IDomainHomepageLinkProps {
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * @internal
 */
export function DomainHomepageLink({ onClick }: IDomainHomepageLinkProps) {
    return (
        <WorkspacePickerHomeFooter href={getHomePageHref()} onClick={onClick}>
            <FormattedMessage id="gs.header.projectPicker.home" />
        </WorkspacePickerHomeFooter>
    );
}
