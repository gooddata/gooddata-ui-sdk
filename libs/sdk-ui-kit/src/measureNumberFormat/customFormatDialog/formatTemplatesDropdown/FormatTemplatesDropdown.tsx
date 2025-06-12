// (C) 2020-2022 GoodData Corporation
import React from "react";
import { ISeparators } from "@gooddata/sdk-ui";
import DropdownItem from "./DropdownItem.js";
import DropdownToggleButton from "./DropdownToggleButton.js";
import { IFormatTemplate } from "../../typings.js";
import { Overlay } from "../../../Overlay/index.js";

interface ICustomFormatTemplatesState {
    isOpened: boolean;
}

export type OnChange = (formatString: string) => void;

export interface ICustomFormatTemplatesProps {
    onChange: OnChange;
    separators?: ISeparators;
    templates: ReadonlyArray<IFormatTemplate>;
}

export class FormatTemplatesDropdown extends React.Component<
    ICustomFormatTemplatesProps,
    ICustomFormatTemplatesState
> {
    public state = {
        isOpened: false,
    };

    public render() {
        const { isOpened } = this.state;
        const { templates, separators } = this.props;
        return (
            <div className="gd-measure-format-templates">
                <DropdownToggleButton toggleDropdown={this.toggleDropdown} isOpened={isOpened} />
                {isOpened ? (
                    <Overlay
                        closeOnOutsideClick={true}
                        closeOnParentScroll={true}
                        alignTo=".gd-measure-custom-format-dialog-section-title"
                        alignPoints={[{ align: "br tr" }, { align: "cr cl", offset: { x: 10 } }]}
                        onClose={this.closeDropdown}
                    >
                        <div className="gd-dropdown overlay">
                            <div className="gd-measure-number-format-dropdown-body s-measure-number-format-templates-dropdown">
                                {templates.map((template) => (
                                    <DropdownItem
                                        key={template.localIdentifier}
                                        template={template}
                                        onClick={this.onSelect}
                                        separators={separators}
                                    />
                                ))}
                            </div>
                        </div>
                    </Overlay>
                ) : null}
            </div>
        );
    }

    private closeDropdown = () => {
        this.setState({ isOpened: false });
    };

    private onSelect = (selectedPreset: IFormatTemplate) => {
        this.props.onChange(selectedPreset.format);
        setTimeout(() => {
            this.closeDropdown();
        });
    };

    private toggleDropdown = () => {
        this.setState((state) => ({ isOpened: !state.isOpened }));
    };
}
