// (C) 2023-2026 GoodData Corporation

import { type ComponentType } from "react";

import { wrapDisplayName } from "@gooddata/sdk-ui";

import { type IBaseHeadlineTitle, type IWithTitleProps } from "../../../interfaces/BaseHeadlines.js";

export const withTitle = <T, H extends IBaseHeadlineTitle>(
    BaseHeadlineDataItem: ComponentType<T>,
): ComponentType<T & IWithTitleProps<H>> => {
    function WithTitle(props: T & IWithTitleProps<H>) {
        const { shouldHideTitle, titleRef, dataItem } = props;
        return (
            <div className="headline-item-with-title">
                {shouldHideTitle ? (
                    <div className="sr-only">{dataItem?.title}</div>
                ) : (
                    <div
                        className="headline-title-wrapper s-headline-title-wrapper"
                        title={dataItem?.title}
                        ref={titleRef}
                    >
                        {dataItem?.title}
                    </div>
                )}
                <BaseHeadlineDataItem {...props} />
            </div>
        );
    }
    return wrapDisplayName("withTitle", BaseHeadlineDataItem)(WithTitle);
};
