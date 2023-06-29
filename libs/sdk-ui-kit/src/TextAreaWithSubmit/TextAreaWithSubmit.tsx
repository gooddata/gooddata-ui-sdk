// (C) 2007-2022 GoodData Corporation
import React, { Component, ReactNode, RefObject } from "react";
import identity from "lodash/identity.js";

import { ITextAreaWithSubmitProps, ITextAreaWithSubmitState } from "./typings.js";

/**
 * @internal
 */
export class TextAreaWithSubmit extends Component<ITextAreaWithSubmitProps, ITextAreaWithSubmitState> {
    static defaultProps = {
        className: "",
        maxLength: 100000,
        rows: 1,
        onCancel: identity,
        onEditingStart: identity,
        onChange: identity,
        placeholder: "",
        scrollToEndOnEditingStart: true,
        autofocus: false,
        disabled: false,
    };
    private readonly root: RefObject<any>;
    private readonly textarea: RefObject<HTMLTextAreaElement>;
    private focusTimeout: number = 0;

    constructor(props: ITextAreaWithSubmitProps) {
        super(props);

        this.state = {
            value: props.defaultValue,
            isEditing: false,
        };

        this.root = React.createRef();
        this.textarea = React.createRef();
    }

    componentDidMount(): void {
        const rootNode = this.root.current;
        rootNode.addEventListener("dragstart", this.onSelectStart);
        rootNode.addEventListener("selectstart", this.onSelectStart);

        if (this.props.autofocus) {
            this.edit();
        }
    }

    UNSAFE_componentWillReceiveProps(newProps: ITextAreaWithSubmitProps): void {
        if (this.props.defaultValue !== newProps.defaultValue) {
            this.setState({
                value: newProps.defaultValue,
            });
        }
    }

    componentWillUnmount(): void {
        const rootNode = this.root.current;
        rootNode.removeEventListener("dragstart", this.onSelectStart);
        rootNode.removeEventListener("selectstart", this.onSelectStart);
        this.removeListeners();
        clearTimeout(this.focusTimeout);
    }

    onDocumentClick = (e: MouseEvent): void => {
        if (this.isClickOutsideTextarea(e.target)) {
            const textAreaNode = this.textarea.current;
            textAreaNode.blur();
        }
    };

    onSelectStart(e: React.MouseEvent): void {
        e.stopPropagation();
    }

    onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        const isSubmit = e.key === "Enter" && !e.shiftKey;
        const isCancel = e.key === "Escape";

        if (isSubmit || isCancel) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (isSubmit) {
            this.onSubmit();
        }
        if (isCancel) {
            this.onCancel();
        }
    };

    onSubmit = (): void => {
        const oldValue = this.props.defaultValue;
        const newTrimmedValue = this.state.value.trim();

        if (newTrimmedValue === "") {
            this.setState({
                value: "",
            });
        }

        if (oldValue !== newTrimmedValue) {
            this.props.onSubmit(newTrimmedValue);
        } else {
            this.props.onCancel(oldValue);
        }

        this.setState({
            value: newTrimmedValue,
            isEditing: false,
        });
        this.removeListeners();
    };

    onCancel = (): void => {
        const { defaultValue } = this.props;

        this.props.onCancel(defaultValue);

        this.setState({
            value: defaultValue,
            isEditing: false,
        });
        this.removeListeners();
    };

    onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const { value } = e.target;
        this.setState({ value }, () => {
            this.props.onChange(value);
        });
    };

    edit = (_e?: React.MouseEvent<HTMLDivElement>): void => {
        if (!this.state.isEditing) {
            this.setState(
                {
                    isEditing: true,
                },
                () => {
                    this.selectAndFocus();
                    document.addEventListener("mousedown", this.onDocumentClick);
                },
            );

            this.props.onEditingStart();
        }
    };

    isClickOutsideTextarea(clickedTarget: EventTarget): boolean {
        return this.textarea.current && !this.textarea.current.contains(clickedTarget as HTMLElement);
    }

    isMultiLine(): boolean {
        return this.props.rows > 1;
    }

    removeListeners(): void {
        document.removeEventListener("mousedown", this.onDocumentClick);
    }

    selectAndFocus = (): void => {
        const componentElement = this.textarea.current;
        const { scrollToEndOnEditingStart } = this.props;

        if (componentElement) {
            window.clearTimeout(this.focusTimeout);
            // without the timeout the focus sometimes got stolen by the previously active item for some reason
            this.focusTimeout = window.setTimeout(() => {
                componentElement.focus();

                if (scrollToEndOnEditingStart && this.isMultiLine()) {
                    componentElement.scrollTop = componentElement.scrollHeight;
                }

                componentElement.select();
            }, 1);
        }
    };

    renderTextarea(style = {}): ReactNode {
        const { rows, disabled, maxLength, placeholder, className } = this.props;
        const { value } = this.state;
        return (
            <textarea
                className={className}
                style={style}
                rows={rows}
                maxLength={maxLength}
                onKeyDown={this.onKeyDown}
                onBlur={this.onSubmit}
                onChange={this.onChange}
                value={value}
                placeholder={placeholder}
                ref={this.textarea}
                disabled={disabled}
            />
        );
    }

    renderTextAreaWithSubmitEdit(): ReactNode {
        return this.renderTextarea({});
    }

    render(): ReactNode {
        return (
            <div role="editable-label" onClick={this.edit}>
                <div ref={this.root}>{this.renderTextAreaWithSubmitEdit()}</div>
            </div>
        );
    }
}
