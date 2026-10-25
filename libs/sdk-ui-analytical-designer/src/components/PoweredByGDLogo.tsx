// (C) 2007-2026 GoodData Corporation

import { useDispatch, useSelector } from "react-redux";

import { poweredByGDCClicked } from "../sagas/powered_by_gdc/powered_by_gdc_ui_actions.js";
import { isPoweredByGDLogoPresent, poweredByGDLogoLink } from "../selectors/PoweredByLogoSelector.js";
import { type AppDispatch, type IAppState } from "../store/types.js";

export function PoweredByGDLogo() {
    const isPresent = useSelector((state: IAppState) => isPoweredByGDLogoPresent(state));
    const logoLink = useSelector((state: IAppState) => poweredByGDLogoLink(state));
    const dispatch = useDispatch<AppDispatch>();

    const logPoweredByGDClicked = () => {
        dispatch(poweredByGDCClicked());
    };

    return (
        <>
            {isPresent ? (
                <div className="gd-powered-by-logo-wrapper" onClick={logPoweredByGDClicked}>
                    <a href={logoLink} target="_blank" rel="noopener noreferrer" />
                </div>
            ) : null}
        </>
    );
}
