// (C) 2020 GoodData Corporation
import * as React from "react";
import Overlay from "@gooddata/goodstrap/lib/core/Overlay";
import { ISeparators } from "@gooddata/sdk-ui";
import DropdownItem from "./DropdownItem";
import DropdownToggleButton from "./DropdownToggleButton";

interface ICustomFormatTemplatesState {
    isOpened: boolean;
}

export interface IFormatTemplate {
    localIdentifier: string;
    format: string;
    name: string;
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
                {isOpened && (
                    <Overlay
                        closeOnOutsideClick={true}
                        closeOnParentScroll={true}
                        alignTo=".gd-measure-custom-format-dialog-section-title"
                        alignPoints={[{ align: "br tr" }]}
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
                )}
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
