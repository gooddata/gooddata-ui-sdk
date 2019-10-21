// (C) 2007-2019 GoodData Corporation
import React from "react";

import RegistrationComponent from "./Registration";

export const Registration: React.FC = props => (
    <div>
        <style jsx={true}>
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

        <RegistrationComponent {...props} />
    </div>
);
