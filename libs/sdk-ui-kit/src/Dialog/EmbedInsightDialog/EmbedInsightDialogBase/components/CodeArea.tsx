// (C) 2022 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export interface ICodeArea {
    code: string;
}

/**
 * @internal
 */
export const CodeArea: React.VFC<ICodeArea> = (props) => {
    const { code } = props;

    return (
        <div className="embed-insight-dialog-code-content">
            <textarea className="embed-insight-dialog-code-area s-code-content" readOnly value={code} />
        </div>
    );
};
