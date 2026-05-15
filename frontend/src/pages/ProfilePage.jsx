import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const schema = Yup.object({
  name: Yup.string().min(2, "Min 2 chars").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  profile_picture: Yup.string().url("Must be a valid URL").nullable(),
});

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [status, setStatus] = useState("");
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    profile_picture: "",
  });

  useEffect(() => {
    if (user) {
      setInitialValues({
        name: user.name || "",
        email: user.email || "",
        profile_picture: user.profile_picture || "",
      });
    }
  }, [user]);

  return (
    <AppLayout title="Profile">
      <div className="card p-4 shadow-sm profile-card glass-panel">
        <div className="d-flex align-items-center gap-3 mb-3">
          <img
            src={initialValues.profile_picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop"}
            alt="Profile"
            className="profile-avatar"
          />
          <div>
            <h5 className="mb-1">{initialValues.name || "Your Name"}</h5>
            <p className="mb-0 text-secondary">{initialValues.email || "your@email.com"}</p>
          </div>
        </div>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const response = await api.put("/profile", values);
              setUser(response.data);
              setStatus("Profile updated successfully.");
            } catch (_error) {
              setStatus("Failed to update profile.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <Field className="form-control" name="name" />
                {touched.name && errors.name && <small className="text-danger">{errors.name}</small>}
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <Field className="form-control" name="email" type="email" />
                {touched.email && errors.email && <small className="text-danger">{errors.email}</small>}
              </div>
              <div className="mb-3">
                <label className="form-label">Profile picture URL</label>
                <Field className="form-control" name="profile_picture" />
                {touched.profile_picture && errors.profile_picture && (
                  <small className="text-danger">{errors.profile_picture}</small>
                )}
              </div>
              <button className="btn btn-primary rounded-pill px-4" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save profile"}
              </button>
              {status && <div className="alert alert-info py-2 mt-3 mb-0">{status}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </AppLayout>
  );
}

export default ProfilePage;
