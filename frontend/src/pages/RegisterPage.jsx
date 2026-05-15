import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const schema = Yup.object({
  name: Yup.string().min(2, "Min 2 chars").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Min 6 chars").required("Password is required"),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return (
    <div className="container py-5 auth-container auth-scene">
      <div className="auth-float auth-float-left" />
      <div className="auth-float auth-float-right" />
      <div className="row g-4 align-items-stretch">
        <div className="col-lg-6">
          <div className="auth-showcase h-100">
            <p className="auth-tag">PREMIUM WORKSPACE</p>
            <h1 className="auth-title">Build momentum every day.</h1>
            <p className="auth-text">Create your command center with fast boards, clean collaboration, and delightful focus tools.</p>
            <div className="auth-badges">
              <span>Glass UI</span>
              <span>Live Analytics</span>
              <span>Drag & Drop</span>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm p-4 mx-auto auth-card glass-panel">
            <p className="small text-uppercase text-primary-emphasis mb-2">Get started</p>
            <h3 className="mb-3">Create your account</h3>
            <Formik
              initialValues={{ name: "", email: "", password: "" }}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                try {
                  setStatus(null);
                  const response = await api.post("/auth/register", values);
                  localStorage.setItem("token", response.data.token);
                  setUser(response.data.user);
                  navigate("/dashboard");
                } catch (error) {
                  setStatus(error.response?.data?.message || "Registration failed");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status }) => (
                <Form>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="name">Name</label>
                    <Field className="form-control" id="name" name="name" />
                    <small className="text-danger"><ErrorMessage name="name" /></small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">Email</label>
                    <Field className="form-control" id="email" name="email" type="email" />
                    <small className="text-danger"><ErrorMessage name="email" /></small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="password">Password</label>
                    <Field className="form-control" id="password" name="password" type="password" />
                    <small className="text-danger"><ErrorMessage name="password" /></small>
                  </div>
                  {status && <div className="alert alert-danger py-2">{status}</div>}
                  <button className="btn btn-primary w-100 rounded-pill" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create account"}
                  </button>
                </Form>
              )}
            </Formik>
            <p className="mb-0 mt-3">Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
