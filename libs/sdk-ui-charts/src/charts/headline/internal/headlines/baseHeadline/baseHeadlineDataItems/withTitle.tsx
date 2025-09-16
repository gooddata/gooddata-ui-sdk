// (C) 2023-2025 GoodData Corporation

import { ComponentType } from "react";

import { wrapDisplayName } from "@gooddata/sdk-ui";

import { IBaseHeadlineTitle, IWithTitleProps } from "../../../interfaces/BaseHeadlines.js";

export const withTitle = <T, H extends IBaseHeadlineTitle>(
    BaseHeadlineDataItem: ComponentType<T>,
): ComponentType<T & IWithTitleProps<H>> => {
    function WithTitle(props: T & IWithTitleProps<H>) {
        const { shouldHideTitle, titleRef, dataItem } = props;
        return (
            <>
                <BaseHeadlineDataItem {...props} />
                {shouldHideTitle ? null : (
                    <div
                        className="headline-title-wrapper s-headline-title-wrapper"
                        title={dataItem?.title}
                        ref={titleRef}
                    >
                        {dataItem?.title}
                    </div>
                )}
            </>
        );
    }
    return wrapDisplayName("withTitle", BaseHeadlineDataItem)(WithTitle);
};
