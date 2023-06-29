// (C) 2023 GoodData Corporation

import React from "react";
import { Input } from "@gooddata/sdk-ui-kit";

import { ConfigurationCategory } from "../ConfigurationCategory.js";

interface IAttributeTitleRenamingProps {
    categoryTitle: string;
    resetTitleText: string;
    showResetTitle: boolean;
    attributeTitle?: string;
    onClick: () => void;
    onChange: (value: string) => void;
}

export const AttributeTitleRenaming: React.FC<IAttributeTitleRenamingProps> = (props) => {
    const { categoryTitle, resetTitleText, showResetTitle, attributeTitle, onClick, onChange } = props;

    const buttonClassNames =
        "gd-button gd-button-link attribute-filter-renaming-title-reset s-attribute-filter-renaming-title-reset";

    return (
        <div>
            <div className="configuration-category-title">
                <ConfigurationCategory categoryTitle={categoryTitle} />
                {showResetTitle ? (
                    <a
                        className={buttonClassNames}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClick}
                    >
                        {resetTitleText}
                    </a>
                ) : null}
            </div>
            <Input
                className="configuration-attribute-filter-title s-configuration-attribute-filter-title"
                value={attributeTitle}
                onChange={onChange as any}
            />
        </div>
    );
};
