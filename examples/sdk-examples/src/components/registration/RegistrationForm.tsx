// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Redirect, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import has from "lodash/has";
import { withFormik, FormikProps } from "formik";
import Yup from "yup";
import { CustomLoading } from "../CustomLoading";

export const errorMap: any = {
    gdc1051: "password",
    gdc1052: "email",
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const transformApiError = ({ errorCode, message }: any): any =>
    has(errorMap, errorCode) ? { [errorMap[errorCode]]: message } : null;

interface IRegistrationFormValues {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    company: string;
    captcha: string;
    termsOfUse: boolean;
}

interface IRegistrationFormProps {
    redirectUri?: string;
    isLoggedIn: boolean;
    register: (
        username: string,
        password: string,
        firstName: string,
        lastName: string,
    ) => Promise<any> | undefined;
}

const enhance = withFormik<IRegistrationFormProps, IRegistrationFormValues>({
    mapPropsToValues: () => ({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        company: "",
        captcha: "",
        termsOfUse: false,
    }),
    validationSchema: Yup.object().shape({
        email: Yup.string().email("Invalid e-mail address").required("E-mail is required"),
        firstName: Yup.string().required("First name is required"),
        lastName: Yup.string().required("Last name is required"),
        password: Yup.string().required("Password is required"),
        company: Yup.string().required("Company is required"),
        captcha: Yup.string().required("CAPTCHA is required"),
        termsOfUse: Yup.bool()
            .oneOf([true], "You must agree with the terms of use")
            .required("You must agree with the terms of use"),
    }),
    handleSubmit: (
        { email, password, firstName, lastName },
        { setSubmitting, setStatus, setErrors, props: { register } },
    ) => {
        setStatus({
            error: null,
            isLoading: true,
        });
        register(email, password, firstName, lastName)!
            .then((response) => {
                setSubmitting(false);
                setStatus({ response });
            })
            .catch((error) => {
                const status: any = {
                    response: null,
                    isLoading: false,
                };
                if (error.responseBody) {
                    const errorResponse = JSON.parse(error.responseBody);
                    const errors = transformApiError(errorResponse.error); // Try to assign errors to input fields
                    if (errors) {
                        setErrors(errors);
                        status.error = null;
                    }
                }
                if (status.error !== null) {
                    // if not possible to pair errors to inputs, render error message above submit button
                    status.error = {
                        message: "Registration error",
                        description: error.message,
                    };
                }
                setStatus(status);
                setSubmitting(false);
            });
    },
    displayName: "RegistrationForm", // helps with React DevTools
});

const CoreRegistrationForm: React.FC<IRegistrationFormProps & FormikProps<IRegistrationFormValues>> = (
    props,
) => {
    const {
        values,
        touched,
        status = {},
        errors,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        redirectUri = "/",
        isLoggedIn = null,
    } = props;

    if (status.response) {
        return (
            <Redirect
                to={{
                    pathname: "/login",
                    state: {
                        email: values.email,
                        password: values.password,
                    },
                }}
            />
        );
    }

    if (isLoggedIn) {
        return <Redirect to={redirectUri} />;
    }

    return (
        <form onSubmit={handleSubmit}>
            <style jsx>
                {`
                    form {
                        max-width: 400px;
                        margin: 0 auto;
                    }

                    form > div {
                        margin: 20px 0;
                    }

                    .error {
                        display: block;
                        margin-top: 10px;
                    }

                    .gd-input input {
                        display: block;
                        margin-top: 5px;
                        color: #6d7680;
                    }
                `}
            </style>
            <div>
                <label className="gd-input">
                    First name*
                    <input
                        className={`gd-input-field${
                            errors.firstName && touched.firstName ? " has-error" : ""
                        }`}
                        value={values.firstName}
                        id="firstName"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="given-name"
                    />
                </label>
                {errors.firstName && touched.firstName && (
                    <div className="gd-message error">{errors.firstName}</div>
                )}
            </div>
            <div>
                <label className="gd-input">
                    Last name*
                    <input
                        className={`gd-input-field${errors.lastName && touched.lastName ? " has-error" : ""}`}
                        value={values.lastName}
                        id="lastName"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="family-name"
                    />
                </label>
                {errors.lastName && touched.lastName && (
                    <div className="gd-message error">{errors.lastName}</div>
                )}
            </div>
            <div>
                <label className="gd-input">
                    Company*
                    <input
                        className={`gd-input-field${errors.company && touched.company ? " has-error" : ""}`}
                        value={values.company}
                        id="company"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="company"
                    />
                </label>
                {errors.company && touched.company && (
                    <div className="gd-message error">{errors.company}</div>
                )}
            </div>
            <div>
                <label className="gd-input">
                    E-mail*
                    <input
                        className={`gd-input-field${errors.email && touched.email ? " has-error" : ""}`}
                        value={values.email}
                        id="email"
                        placeholder="Enter a valid e-mail address"
                        type="text"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="email"
                    />
                </label>
                {errors.email && touched.email && <div className="gd-message error">{errors.email}</div>}
            </div>
            <div>
                <label className="gd-input">
                    Password*
                    <input
                        className={`gd-input-field${errors.password && touched.password ? " has-error" : ""}`}
                        value={values.password}
                        id="password"
                        type="password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="password"
                    />
                </label>
                {errors.password && touched.password && (
                    <div className="gd-message error">{errors.password}</div>
                )}
            </div>
            <div>
                <ReCAPTCHA
                    sitekey="6LcduVUUAAAAABUt48F_cf27DEY0uOzKGIzpzGAm"
                    onChange={(value) => setFieldValue("captcha", value)}
                    onExpired={() => setFieldValue("captcha", "")}
                />
                {errors.captcha && touched.captcha && (
                    <div className="gd-message error">{errors.captcha}</div>
                )}
            </div>
            <div>
                <label>
                    <input
                        className="input-checkbox"
                        type="checkbox"
                        id="termsOfUse"
                        checked={values.termsOfUse}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    I agree with the GoodData{" "}
                    <a href="https://www.gooddata.com/terms.html" rel="noopener noreferrer" target="_blank">
                        Terms of Use
                    </a>
                </label>
                {errors.termsOfUse && touched.termsOfUse && (
                    <div className="gd-message error">{errors.termsOfUse}</div>
                )}
                <p>
                    In order to provide You with an identity in Platform, GoodData needs to process Your
                    personal information requested on this page. You can learn more in our{" "}
                    <a
                        href="https://www.gooddata.com/privacy-policy"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
                <p>
                    Should you have any question or requests regarding the data processing, you can contact us
                    at <a href="mailto:privacy@gooddata.com">privacy@gooddata.com</a>.
                </p>
                <p>*) All fields are required.</p>
            </div>

            {status.isLoading && <CustomLoading label="Registering..." height={100} />}
            {status.error && (
                <div className="gd-message error">
                    <strong>Registration failed.</strong>
                    <p>{status.error.description}</p>
                    <p>
                        You can try resubmitting the registration form or{" "}
                        <Link to="/login">logging in manually</Link>
                    </p>
                </div>
            )}

            <div className="form-actions">
                <button
                    disabled={isSubmitting}
                    className={`gd-button gd-button-primary gd-button-important${
                        isSubmitting ? " disabled" : ""
                    }`}
                    tabIndex={-1}
                    type="submit"
                >
                    Register
                </button>
            </div>
        </form>
    );
};

export const RegistrationForm = enhance(CoreRegistrationForm);
