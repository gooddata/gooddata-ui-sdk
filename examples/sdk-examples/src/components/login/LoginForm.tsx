// (C) 2019-2022 GoodData Corporation
import React from "react";
import { withFormik, FormikProps } from "formik";
import * as Yup from "yup";
import { CustomLoading } from "../CustomLoading";
import { CustomError } from "../CustomError";
import { AuthStatus } from "../../context/auth";

interface IFormValues {
    email?: string;
    password?: string;
}

interface ILoginProps {
    email?: string;
    password?: string;
    isLoading: boolean;
    apiError: string | undefined;
    logIn: (email: string, password: string) => Promise<any> | any;
}

const enhance = withFormik<ILoginProps, IFormValues>({
    mapPropsToValues: ({ email = "", password = "" }) => ({
        email,
        password,
    }),
    validationSchema: Yup.object().shape({
        email: Yup.string().email("Invalid e-mail address").required("E-mail is required"),
        password: Yup.string().required("Password is required"),
    }),
    handleSubmit: ({ email, password }, { props: { logIn }, setSubmitting }) => {
        email && password
            ? logIn(email, password)
                  .then(() => {
                      setSubmitting(false);
                  })
                  .catch(() => {
                      setSubmitting(false);
                  })
            : setSubmitting(false);
    },
    displayName: "LoginForm", // helps with React DevTools
});

const CoreLoginForm: React.FC<ILoginProps & FormikProps<IFormValues>> = (props) => {
    const {
        values,
        touched,
        errors,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        isLoading,
        apiError,
    } = props;

    const errorMessageBody =
        apiError?.toUpperCase() === AuthStatus.UNAUTHORIZED
            ? `${apiError} Wrong email or password.`
            : apiError;

    const errorMessage = `Error: ${errorMessageBody}`;

    return (
        <div className="Login">
            {/* language=CSS */}
            <style jsx>{`
                .Login {
                    max-width: 400px;
                    margin: 20px auto;
                    flex: 1 0 auto;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    align-self: center;
                    text-align: center;
                }

                .LoginLogo {
                    margin-bottom: 10px;
                }

                .LoginForm {
                    width: 100%;
                }

                .LoginForm > div {
                    margin: 20px 0;
                }

                .error {
                    display: block;
                    margin-top: 10px;
                }

                label {
                    display: block;
                    margin-bottom: 5px;
                    color: #6d7680;
                    text-align: left;
                }
            `}</style>
            <img
                src="https://secure.gooddata.com/images/logo-new.png"
                alt="GoodData"
                style={{ height: 70 }}
                className="LoginLogo"
            />
            <form className="LoginForm s-loginForm" onSubmit={handleSubmit}>
                <h1>Sign in to the Examples&nbsp;Gallery</h1>

                <div className="gd-input">
                    <label htmlFor="email">E-mail</label>
                    <input
                        className={`gd-input-field s-login-input-email ${
                            errors.email && touched.email ? " has-error" : ""
                        }`}
                        type="email"
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="e-mail"
                    />
                    {errors.email && touched.email ? (
                        <div className="gd-message error">{errors.email}</div>
                    ) : null}
                </div>
                <div className="gd-input">
                    <label htmlFor="password">Password</label>
                    <input
                        className={`gd-input-field s-login-input-password ${
                            errors.password && touched.password ? " has-error" : ""
                        }`}
                        type="password"
                        name="password"
                        id="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="password"
                    />
                    {errors.password && touched.password ? (
                        <div className="gd-message error">{errors.password}</div>
                    ) : null}
                </div>
                {apiError && !isLoading ? <CustomError height={undefined} message={errorMessage} /> : null}
                {isLoading ? <CustomLoading height={100} label="Logging in&hellip;" /> : null}
                <div className="gd-input buttons">
                    <button
                        type="submit"
                        className={`gd-button gd-button-primary gd-button-important submit-button s-login-submit${
                            isSubmitting || isLoading ? " disabled" : ""
                        }`}
                        disabled={isSubmitting || isLoading}
                        tabIndex={-1}
                    >
                        Sign in
                    </button>
                </div>
            </form>
        </div>
    );
};

export const LoginForm = enhance(CoreLoginForm);
