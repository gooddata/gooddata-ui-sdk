// (C) 2022 GoodData Corporation
import { IntlWrapper } from "@gooddata/sdk-ui";
import React from "react";
import { IInsight } from "@gooddata/sdk-model";
import { EmbedInsightDialogBase, Overlay } from "@gooddata/sdk-ui-kit";

// import { Overlay } from "../../Overlay";
//import { EmbedInsightDialogBase } from "./EmbedInsightDialogBase/EmbedInsightDialogBase";

/**
 * @internal
 */
export interface IEmbedInsightDialogProps {
    insight: IInsight;
    // context?: IEmbeddingCodeContext;
    locale?: string;
    onClose: () => void;
    onCopyCode: () => void;
}

/**
 * @internal
 */
export const EmbedInsightDialog: React.VFC<IEmbedInsightDialogProps> = (props) => {
    const { locale, onClose, onCopyCode } = props;
    return (
        <IntlWrapper locale={locale}>
            <ModalOverlay>
                <EmbedInsightDialogBase
                    code={""}
                    codeByReference={true}
                    onClose={onClose}
                    onCopyCode={onCopyCode}
                />
            </ModalOverlay>
        </IntlWrapper>
    );
};

const ModalOverlay: React.FC = (props) => {
    const { children } = props;
    return (
        <Overlay
            alignPoints={[
                {
                    align: "cc cc",
                },
            ]}
            isModal
            positionType="fixed"
        >
            {children}
        </Overlay>
    );
};
