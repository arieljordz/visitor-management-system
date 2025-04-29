import { Link } from "react-router-dom";

const VerifyEmail = () => (
  <div className="container mt-5 text-center">
    <h2>Email Verified!</h2>
    <p>Your email has been successfully verified. You can now <Link to="/">log in</Link>.</p>
  </div>
);

export default VerifyEmail;
