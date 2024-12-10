// (C) 2024 GoodData Corporation
import React from "react";

export interface IHintProps {
    hint?: string;
}

const Hint: React.FC<IHintProps> = (props) => {
    const { hint } = props;

    return (
        <>
            <div>
                <span aria-label="Look!" role="img">
                    👉
                </span>{" "}
                {hint}
            </div>
            <p>
                Powered by{" "}
                <a href="https://sdk.gooddata.com/gooddata-ui/" target="_blank" rel="noopener noreferrer">
                    GoodData.UI
                </a>{" "}
                |{" "}
                <a
                    href="https://www.gooddata.com/docs/gooddata-ui/latest/references/visual_components/interactive_examples/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    More Examples
                </a>
            </p>
        </>
    );
};

export default Hint;
