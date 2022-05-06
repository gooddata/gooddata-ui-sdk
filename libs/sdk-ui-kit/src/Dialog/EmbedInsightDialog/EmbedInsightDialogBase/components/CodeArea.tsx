// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";

/**
 * @internal
 */
export interface ICodeAreaProps {
    code: string;
    onCopyCode: (code: string) => void;
}

/**
 * @internal
 */
export const CodeArea: React.VFC<ICodeAreaProps> = (props) => {
    const { code, onCopyCode } = props;

    const onAreaCopyCode = useCallback(() => {
        onCopyCode(code);
    }, [code]);

    return (
        <div className="embed-insight-dialog-code-content">
            <textarea
                className="embed-insight-dialog-code-area s-code-content"
                readOnly
                value={code}
                onCopy={onAreaCopyCode}
            />
        </div>
    );
};
