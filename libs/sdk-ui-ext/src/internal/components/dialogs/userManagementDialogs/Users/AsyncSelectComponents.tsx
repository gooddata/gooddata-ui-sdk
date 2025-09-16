// (C) 2023-2025 GoodData Corporation

import { ReactElement } from "react";

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

import { ISelectErrorOption, IUserSelectOption, isSelectErrorOption, isUserItem } from "../types.js";
import { getUserItemTestId } from "../utils.js";

export function EmptyRenderer(): ReactElement {
    return null;
}

export function LoadingMessageRenderer(): ReactElement {
    return (
        <div className="gd-share-dialog-loading-mask-container">
            <LoadingMask size="small" />
        </div>
    );
}

export function NoOptionsMessageRenderer(
    props: NoticeProps<IUserSelectOption | ISelectErrorOption, false>,
): ReactElement {
    return (
        <div className="s-user-management-no-option" aria-label="Share dialog no match">
            <ReactSelectComponents.NoOptionsMessage {...props} />
        </div>
    );
}

export const MenuListRenderer = wrapMenuList(
    (props: MenuListProps<IUserSelectOption | ISelectErrorOption, false>): ReactElement => {
        return (
            <ReactSelectComponents.MenuList {...props}>
                <div className="s-user-management-dialog-menu" aria-label="Share dialog menu list">
                    {props.children}
                </div>
            </ReactSelectComponents.MenuList>
        );
    },
);

export function InputRendered(
    props: InputProps<IUserSelectOption | ISelectErrorOption, false>,
): ReactElement {
    return (
        <div className="gd-share-dialog-input s-user-management-input">
            <ReactSelectComponents.Input {...props} />
        </div>
    );
}

function OptionContentRenderer(item: IUserSelectOption): ReactElement {
    return (
        <>
            {" "}
            {item.label} <span className={"option-email"}>{item.value.email}</span>{" "}
        </>
    );
}

export function ErrorOptionRenderer(errorOption: ISelectErrorOption): ReactElement {
    return (
        <div
            className="gd-share-dialog-option-error s-user-management-option-error"
            aria-label="Share dialog error"
        >
            <span className="gd-share-dialog-option-error-content">{errorOption.label}</span>
        </div>
    );
}

export function OptionRenderer(
    props: OptionProps<IUserSelectOption | ISelectErrorOption, false>,
): ReactElement {
    const { className, cx, isFocused, innerRef, innerProps, data } = props;

    if (isSelectErrorOption(data)) {
        return ErrorOptionRenderer(data);
    }

    const sTestStyle = isUserItem(data.value) ? getUserItemTestId(data.value) : "";

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
}

export function GroupHeadingRenderer(
    props: GroupHeadingProps<IUserSelectOption | ISelectErrorOption, false>,
): ReactElement {
    const { label } = props.data;
    return (
        <div className="gd-share-dialog-select-group-heading">
            <Typography tagName="h3">{label}</Typography>
        </div>
    );
}
