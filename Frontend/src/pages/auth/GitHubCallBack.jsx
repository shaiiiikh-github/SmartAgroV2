import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL as apiUrl } from "../../components/api";
import { useAuth } from "../../context/authContext";

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthLogin } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      navigate("/login", {
        replace: true,
        state: { error: "GitHub authentication was cancelled or access denied." },
      });
      return;
    }

    if (!code) {
      navigate("/login", {
        replace: true,
        state: { error: "No authorization code returned from GitHub." },
      });
      return;
    }

    handleOAuthLogin(async () => {
      return await axios.post(
        `${apiUrl}/github-login`,
        { code },
        { withCredentials: true }
      );
    })
      .then((success) => {
        if (success) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", {
            replace: true,
            state: { error: "GitHub authentication failed. Please try again." },
          });
        }
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          "GitHub login failed. Please check your network or try again.";
        navigate("/login", {
          replace: true,
          state: { error: msg },
        });
      });
  }, [searchParams, navigate, handleOAuthLogin]);

  return (
    <div className="w-full min-h-[calc(100dvh-7rem)] flex flex-col justify-center items-center px-4">
      <div className="glass-card p-6 sm:p-8 rounded-3xl text-center max-w-sm w-full space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Authenticating with GitHub...
        </p>
      </div>
    </div>
  );
};

export default GitHubCallback;
