// (C) 2007-2026 GoodData Corporation

import { Fragment, memo, useState } from "react";

import { Button } from "@gooddata/sdk-ui-kit";

import { OptionsMenu } from "./OptionsMenu.js";

export const OptionsButton = memo(function OptionsButton(_props: Record<string, unknown>) {
    const [isShowOptionsMenu, setIsShowOptionsMenu] = useState(false);

    const toggleOptionsMenu = () => {
        setIsShowOptionsMenu(!isShowOptionsMenu);
    };

    return (
        <Fragment>
            <Button
                className="gd-button-secondary s-options-button editor-header-item"
                value="&#8943;"
                onClick={toggleOptionsMenu}
            />
            <OptionsMenu isShowOptionsMenu={isShowOptionsMenu} toggleOptionsMenu={toggleOptionsMenu} />
        </Fragment>
    );
});
