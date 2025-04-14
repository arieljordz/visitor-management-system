import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode"; 
import axios from "axios";

const GoogleLoginButton = ({ setUser, setBalance, setMessage }) => {
  const handleGoogleLoginSuccess = async (response) => {
    try {
      const decoded = jwtDecode(response.credential);
      setUser(decoded.email);
      const res = await axios.get(`/api/check-balance/${decoded.email}`);
      setBalance(res.data.balance);
    } catch {
      setMessage("Google login failed");
    }
  };

  const openCenteredPopup = (url, title, w, h) => {
    const left = (window.innerWidth - w) / 2;
    const top = (window.innerHeight - h) / 2;
    return window.open(url, title, `width=${w}, height=${h}, left=${left}, top=${top}`);
  };

  const handlePopup = (response) => {
    const popupUrl = response?.popupUrl;  // Get the URL of the Google login popup
    if (popupUrl) {
      openCenteredPopup(popupUrl, "Google Login", 500, 600); // Customize size (500x600)
    }
  };

  return (
    <div className="mt-4">
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => setMessage("Google login failed")}
        useOneTap
        onPopupOpen={handlePopup} // Custom popup handler
      />
    </div>
  );
};

export default GoogleLoginButton;
