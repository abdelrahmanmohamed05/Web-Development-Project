import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Min 6 chars").required("Password is required"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return (
    <div className="container py-5 auth-container auth-scene">
      <div className="auth-float auth-float-left" />
      <div className="auth-float auth-float-right" />
      <div className="row g-4 align-items-stretch">
        <div className="col-lg-6">
          <div className="auth-showcase h-100">
            <p className="auth-tag">NEXT GEN TASK PLATFORM</p>
            <h1 className="auth-title">Plan faster, execute smarter.</h1>
            <p className="auth-text">
              Organize teams, priorities, and deadlines in a visually rich command center built for high performance.
            </p>
            <div className="auth-badges">
              <span>Live Kanban</span>
              <span>Priority Analytics</span>
              <span>Secure JWT Auth</span>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm p-4 mx-auto auth-card glass-panel">
            <p className="small text-uppercase text-primary-emphasis mb-2">Welcome back</p>
            <h3 className="mb-3">Sign in to TaskFlow Pro</h3>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                try {
                  setStatus(null);
                  const response = await api.post("/auth/login", values);
                  localStorage.setItem("token", response.data.token);
                  setUser(response.data.user);
                  navigate("/dashboard");
                } catch (error) {
                  setStatus(error.response?.data?.message || "Login failed");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status }) => (
                <Form>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <Field className="form-control" id="email" name="email" type="email" />
                    <small className="text-danger">
                      <ErrorMessage name="email" />
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <Field className="form-control" id="password" name="password" type="password" />
                    <small className="text-danger">
                      <ErrorMessage name="password" />
                    </small>
                  </div>
                  {status && <div className="alert alert-danger py-2">{status}</div>}
                  <button className="btn btn-primary w-100 rounded-pill" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Login"}
                  </button>
                </Form>
              )}
            </Formik>
            <p className="mb-0 mt-3">
              New user? <Link to="/register">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
