// (C) 2021-2025 GoodData Corporation
import React, { ReactElement } from "react";

import {
    GroupHeadingProps,
    InputProps,
    MenuListProps,
    NoticeProps,
    OptionProps,
    components as ReactSelectComponents,
} from "react-select";
import { wrapMenuList } from "react-select-async-paginate";

import { LoadingMask, Typography } from "@gooddata/sdk-ui-kit";

import { ISelectErrorOption, ISelectOption, isSelectErrorOption, isWorkspaceItem } from "../types.js";
import { getWorkspaceItemTestId } from "../utils.js";

export const EmptyRenderer = (): ReactElement => {
    return null;
};

export const LoadingMessageRenderer = (): ReactElement => {
    return (
        <div className="gd-share-dialog-loading-mask-container">
            <LoadingMask size="small" />
        </div>
    );
};

export const NoOptionsMessageRenderer = (props: NoticeProps): ReactElement => {
    return (
        <div className="s-user-management-no-option" aria-label="Share dialog no match">
            <ReactSelectComponents.NoOptionsMessage {...props} />
        </div>
    );
};

export const MenuListRendered = (props: MenuListProps<ISelectOption, false>): ReactElement => {
    return (
        <ReactSelectComponents.MenuList {...props}>
            <div className="s-user-management-menu" aria-label="Share dialog menu list">
                {props.children}
            </div>
        </ReactSelectComponents.MenuList>
    );
};

export const WrappedMenuListRenderer = wrapMenuList(
    (props: MenuListProps<ISelectOption, false>): ReactElement => {
        return (
            <ReactSelectComponents.MenuList {...props}>
                <div className="s-user-management-menu" aria-label="Share dialog menu list">
                    {props.children}
                </div>
            </ReactSelectComponents.MenuList>
        );
    },
);

export const InputRendered = (props: InputProps): ReactElement => {
    return (
        <div className="gd-share-dialog-input s-user-management-input">
            <ReactSelectComponents.Input {...props} />
        </div>
    );
};

export const SingleValueInputRenderer = (props: InputProps): ReactElement => {
    if (props.hasValue) {
        return null;
    }

    return (
        <div className="gd-share-dialog-input s-user-management-input">
            <ReactSelectComponents.Input {...props} />
        </div>
    );
};

const OptionContentRenderer = (item: ISelectOption): ReactElement => {
    if (isWorkspaceItem(item.value)) {
        return <> {item.value.title} </>;
    }
    return <> {item.label} </>;
};

export const ErrorOptionRenderer = (errorOption: ISelectErrorOption): ReactElement => {
    return (
        <div
            className="gd-share-dialog-option-error s-user-management-option-error"
            aria-label="Share dialog error"
        >
            <span className="gd-share-dialog-option-error-content">{errorOption.label}</span>
        </div>
    );
};

export const OptionRenderer = (props: OptionProps<ISelectOption, false>): ReactElement => {
    const { className, cx, isFocused, innerRef, innerProps, data } = props;

    if (isSelectErrorOption(data)) {
        return ErrorOptionRenderer(data);
    }

    const sTestStyle = isWorkspaceItem(data.value) ? getWorkspaceItemTestId(data.value) : "";

    const componentStyle = cx(
        {
            option: true,
            "option--is-focused": isFocused,
        },
        className,
    );

    return (
        <div ref={innerRef} className={`${componentStyle} ${sTestStyle}`} {...innerProps}>
            <div className="option-content">{OptionContentRenderer(data)}</div>
        </div>
    );
};

export const GroupHeadingRenderer = (props: GroupHeadingProps): ReactElement => {
    const { label } = props.data;
    return (
        <div className={"gd-share-dialog-select-group-heading"}>
            <Typography tagName="h3">{label}</Typography>
        </div>
    );
};
