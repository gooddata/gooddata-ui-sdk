// (C) 2020-2025 GoodData Corporation
import { useState } from "react";
import { ISeparators } from "@gooddata/sdk-ui";
import DropdownItem from "./DropdownItem.js";
import DropdownToggleButton from "./DropdownToggleButton.js";
import { IFormatTemplate } from "../../typings.js";
import { Overlay } from "../../../Overlay/index.js";

export type OnChange = (formatString: string) => void;

export interface ICustomFormatTemplatesProps {
    onChange: OnChange;
    separators?: ISeparators;
    templates: ReadonlyArray<IFormatTemplate>;
}

export function FormatTemplatesDropdown({ onChange, separators, templates }: ICustomFormatTemplatesProps) {
    const [isOpened, setIsOpened] = useState(false);

    const closeDropdown = () => {
        setIsOpened(false);
    };

    const onSelect = (selectedPreset: IFormatTemplate) => {
        onChange(selectedPreset.format);
        setTimeout(() => {
            closeDropdown();
        });
    };

    const toggleDropdown = () => {
        setIsOpened((state) => !state);
    };

    return (
        <div className="gd-measure-format-templates">
            <DropdownToggleButton toggleDropdown={toggleDropdown} isOpened={isOpened} />
            {isOpened ? (
                <Overlay
                    closeOnOutsideClick={true}
                    closeOnParentScroll={true}
                    alignTo=".gd-measure-custom-format-dialog-section-title"
                    alignPoints={[{ align: "br tr" }, { align: "cr cl", offset: { x: 10 } }]}
                    onClose={closeDropdown}
                >
                    <div className="gd-dropdown overlay">
                        <div className="gd-measure-number-format-dropdown-body s-measure-number-format-templates-dropdown">
                            {templates.map((template) => (
                                <DropdownItem
                                    key={template.localIdentifier}
                                    template={template}
                                    onClick={onSelect}
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
