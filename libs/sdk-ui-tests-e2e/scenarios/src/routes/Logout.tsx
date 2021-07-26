import React from "react";

import Page from "../components/Page";
import LogoutForm from "../components/Auth/LogoutForm";
import { useAuth } from "../contexts/Auth";

import pageStyles from "../components/Page.module.scss";

const Logout: React.FC = () => {
    const { logout } = useAuth();

    return (
        <Page className={pageStyles.Inverse} mainClassName={pageStyles.VerticalCenter}>
            <LogoutForm logout={logout} />
        </Page>
    );
};

export default Logout;
