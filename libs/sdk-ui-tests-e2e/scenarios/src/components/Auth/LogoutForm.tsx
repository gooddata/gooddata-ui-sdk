import React, { useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import CustomLoading from "../CustomLoading";

export interface ILogoutFormProps extends RouteComponentProps {
    logout: () => Promise<void>;
}

const LogoutForm: React.FC<ILogoutFormProps> = ({ history, logout }) => {
    useEffect(
        () => {
            logout().then(() => history.push("/login"));
        },
        // only call the logout on initial mount -> the empty array is correct here
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    return <CustomLoading label="Logging you out..." />;
};

export default withRouter(LogoutForm);
