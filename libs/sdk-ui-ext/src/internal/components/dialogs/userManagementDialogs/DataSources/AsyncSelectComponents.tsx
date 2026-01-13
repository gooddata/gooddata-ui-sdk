// (C) 2021-2025 GoodData Corporation

import { type ReactElement } from "react";

import {
    type GroupHeadingProps,
    type InputProps,
    type MenuListProps,
    type NoticeProps,
    type OptionProps,
    components as ReactSelectComponents,
} from "react-select";

import { LoadingMask, Typography } from "@gooddata/sdk-ui-kit";

import {
    type IDataSourceSelectOption,
    type ISelectErrorOption,
    isDataSourceItem,
    isSelectErrorOption,
} from "../types.js";
import { getDataSourceItemTestId } from "../utils.js";

export function EmptyRenderer(): ReactElement | null {
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
    props: NoticeProps<IDataSourceSelectOption | ISelectErrorOption, false>,
): ReactElement {
    return (
        <div className="s-user-management-no-option" aria-label="Share dialog no match">
            <ReactSelectComponents.NoOptionsMessage {...props} />
        </div>
    );
}

export function MenuListRendered(
    props: MenuListProps<IDataSourceSelectOption | ISelectErrorOption, false>,
): ReactElement {
    return (
        <ReactSelectComponents.MenuList {...props}>
            <div className="s-user-management-menu" aria-label="Share dialog menu list">
                {props.children}
            </div>
        </ReactSelectComponents.MenuList>
    );
}

export function InputRendered(
    props: InputProps<IDataSourceSelectOption | ISelectErrorOption, false>,
): ReactElement {
    return (
        <div className="gd-share-dialog-input s-user-management-input">
            <ReactSelectComponents.Input {...props} />
        </div>
    );
}

function OptionContentRenderer(item: IDataSourceSelectOption): ReactElement {
    if (isDataSourceItem(item.value)) {
        return <> {item.value.name} </>;
    }
    return <> {item.label} </>;
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

export function OptionRenderer({
    className,
    cx,
    isFocused,
    innerRef,
    innerProps,
    data,
}: OptionProps<IDataSourceSelectOption | ISelectErrorOption, false>): ReactElement {
    if (isSelectErrorOption(data)) {
        return ErrorOptionRenderer(data);
    }

    const sTestStyle = isDataSourceItem(data.value) ? getDataSourceItemTestId(data.value) : "";

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
    props: GroupHeadingProps<IDataSourceSelectOption | ISelectErrorOption, false>,
): ReactElement {
    const { label } = props.data;
    return (
        <div className={"gd-share-dialog-select-group-heading"}>
            <Typography tagName="h3">{label}</Typography>
        </div>
    );
}
