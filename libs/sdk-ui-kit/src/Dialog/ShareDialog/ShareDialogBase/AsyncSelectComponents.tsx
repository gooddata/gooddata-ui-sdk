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

import {
    type ISelectErrorOption,
    type ISelectOption,
    isGranteeItem,
    isGranteeUser,
    isSelectErrorOption,
} from "./types.js";
import { getGranteeItemTestId } from "./utils.js";
import { LoadingMask } from "../../../LoadingMask/index.js";
import { Typography } from "../../../Typography/index.js";

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

export function NoOptionsMessageRenderer(props: NoticeProps): ReactElement {
    return (
        <div className="s-gd-share-dialog-no-option" aria-label="Share dialog no match">
            <ReactSelectComponents.NoOptionsMessage {...props} />
        </div>
    );
}

export function MenuListRendered(props: MenuListProps<ISelectOption, false>): ReactElement {
    return (
        <ReactSelectComponents.MenuList {...props}>
            <div className="s-gd-share-dialog-menu" aria-label="Share dialog menu list">
                {props.children}
            </div>
        </ReactSelectComponents.MenuList>
    );
}

export function InputRendered(props: InputProps): ReactElement {
    return (
        <div className="gd-share-dialog-input s-gd-share-dialog-input">
            <ReactSelectComponents.Input {...props} />
        </div>
    );
}

function OptionContentRenderer(item: ISelectOption): ReactElement {
    if (isGranteeUser(item.value)) {
        return (
            <>
                {item.label} <span className={"option-email"}>{item.value.email}</span>
            </>
        );
    }

    return <> {item.label} </>;
}

export function ErrorOptionRenderer(errorOption: ISelectErrorOption): ReactElement {
    return (
        <div
            className={`gd-share-dialog-option-error s-gd-share-dialog-option-error`}
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
}: OptionProps<ISelectOption, false>): ReactElement {
    if (isSelectErrorOption(data)) {
        return ErrorOptionRenderer(data);
    }

    let sTestStyle = "";

    if (isGranteeItem(data.value)) {
        sTestStyle = getGranteeItemTestId(data.value, "option");
    }

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

export function GroupHeadingRenderer(props: GroupHeadingProps): ReactElement {
    const { label } = props.data;
    return (
        <div className={"gd-share-dialog-select-group-heading"}>
            <Typography tagName="h3">{label}</Typography>
        </div>
    );
}
