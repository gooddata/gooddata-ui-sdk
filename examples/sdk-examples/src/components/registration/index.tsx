// (C) 2007-2019 GoodData Corporation
import React from "react";

import { RegistrationForm } from "./RegistrationForm";
import { useAuth, AuthStatus } from "../../context/auth";

export const Registration: React.FC = () => {
    const { register, authStatus } = useAuth();
    return (
        <div>
            <style jsx>
                {`
                    h1,
                    p {
                        margin-right: auto;
                        margin-left: auto;
                        text-align: center;
                    }
                `}
            </style>
            <h1>Registration</h1>

            <p>Create a GoodData developer account to see GoodData.UI examples.</p>

            <hr className="separator" />

            <RegistrationForm isLoggedIn={authStatus === AuthStatus.AUTHORIZED} register={register} />
        </div>
    );
};
