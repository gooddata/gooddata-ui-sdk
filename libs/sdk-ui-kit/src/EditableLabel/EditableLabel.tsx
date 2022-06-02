// (C) 2007-2022 GoodData Corporation
import React, { Component, ReactNode, RefObject } from "react";
import { v4 as uuid } from "uuid";
import identity from "lodash/identity";
import TextareaAutosize from "react-textarea-autosize";
import cx from "classnames";

import { Overlay } from "../Overlay";
import { ENUM_KEY_CODE } from "../typings/utilities";

import { IEditableLabelProps, IEditableLabelState } from "./typings";

/**
 * @internal
 */
export interface IEditableLabelInnerProps extends IEditableLabelProps {
    innerRef: React.ForwardedRef<HTMLDivElement>;
}

/**
 * @internal
 */
export class EditableLabelInner extends Component<IEditableLabelInnerProps, IEditableLabelState> {
    static defaultProps = {
        children: false,
        className: "",
        maxLength: 100000,
        maxRows: 1,
        onCancel: identity,
        onEditingStart: identity,
        onChange: identity,
        placeholder: "",
        scrollToEndOnEditingStart: true,
        textareaInOverlay: false,
        autofocus: false,
    };
    private readonly root: RefObject<any>;
    private readonly textarea: RefObject<HTMLTextAreaElement>;

    constructor(props: IEditableLabelInnerProps) {
        super(props);

        this.state = {
            value: props.value,
            isEditing: false,
            textareaWidth: 100,
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

    UNSAFE_componentWillReceiveProps(newProps: IEditableLabelProps): void {
        if (this.props.value !== newProps.value) {
            this.setState({
                value: newProps.value,
            });
        }
    }

    componentWillUnmount(): void {
        const rootNode = this.root.current;
        rootNode.removeEventListener("dragstart", this.onSelectStart);
        rootNode.removeEventListener("selectstart", this.onSelectStart);
        this.removeListeners();
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
        const isSubmit = e.keyCode === ENUM_KEY_CODE.KEY_CODE_ENTER;
        const isCancel = e.keyCode === ENUM_KEY_CODE.KEY_CODE_ESCAPE;

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
        const oldValue = this.props.value;
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
        const { value } = this.props;

        this.props.onCancel(value);

        this.setState({
            value,
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
        return this.props.maxRows > 1;
    }

    removeListeners(): void {
        document.removeEventListener("mousedown", this.onDocumentClick);
    }

    measureRootDimensions(): void {
        const rootElement = this.root.current;
        const rootElementFontSize = getComputedStyle(rootElement).fontSize;

        this.setState({
            textareaWidth: rootElement.offsetWidth,
            textareaFontSize: Math.floor(parseInt(rootElementFontSize, 10)),
        });
    }

    selectAndFocus = (): void => {
        const componentElement = this.textarea.current;
        const { scrollToEndOnEditingStart, textareaInOverlay } = this.props;

        if (componentElement) {
            componentElement.focus();

            if (scrollToEndOnEditingStart && this.isMultiLine()) {
                componentElement.scrollTop = componentElement.scrollHeight;
            }

            componentElement.select();

            if (textareaInOverlay) {
                this.measureRootDimensions();
            }
        }
    };

    renderTextAreaInOverlay(): ReactNode {
        const alignId = `gd-editable-label-${uuid()}`;

        const style = {
            width: this.state.textareaWidth,
            fontSize: `${this.state.textareaFontSize}px`,
            // http://stackoverflow.com/a/6295222
            lineHeight: `${this.state.textareaFontSize * 1.25}px`,
        };

        return (
            <div className={`${alignId} gd-editable-label-textarea-wrapper`}>
                <Overlay
                    alignTo={`.${alignId}`}
                    alignPoints={[
                        {
                            align: "cr cr",
                        },
                    ]}
                >
                    <div className="gd-editable-label-overlay">{this.renderTextarea(style)}</div>
                </Overlay>
            </div>
        );
    }

    renderTextarea(style = {}): ReactNode {
        return (
            <TextareaAutosize
                style={style}
                rows={1}
                maxRows={this.props.maxRows}
                maxLength={this.props.maxLength}
                onKeyDown={this.onKeyDown}
                onBlur={this.onSubmit}
                onChange={this.onChange}
                defaultValue={this.props.value}
                placeholder={this.props.placeholder}
                ref={this.textarea}
            />
        );
    }

    renderEditableLabelEdit(): ReactNode {
        return this.props.textareaInOverlay
            ? this.renderTextAreaInOverlay()
            : this.renderTextarea(
                  this.root.current.clientWidth ? { width: this.root.current.clientWidth } : {},
              );
    }

    render(): ReactNode {
        const editableLabelClasses = cx(
            {
                "gd-editable-label": true,
                "s-editable-label": true,
                "is-editing": this.state.isEditing,
                placeholder: this.state.value === "",
            },
            this.props.className,
        );

        const displayValue = this.props.children || this.state.value || this.props.placeholder;

        return (
            <div ref={this.props.innerRef} className={editableLabelClasses} onClick={this.edit}>
                <div className="gd-editable-label-inner" ref={this.root}>
                    {this.state.isEditing ? this.renderEditableLabelEdit() : displayValue}
                </div>
            </div>
        );
    }
}

/**
 * @internal
 */
export const EditableLabel = React.forwardRef<HTMLDivElement, IEditableLabelProps>((props, ref) => {
    return <EditableLabelInner {...props} innerRef={ref} />;
});
