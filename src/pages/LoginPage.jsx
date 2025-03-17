import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); // Simpan token di localStorage
        toast.success("Login berhasil!", { position: "bottom-right" });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        toast.error(data.message, { position: "bottom-right" });
      }
    } catch (e) {
      toast.error("Terjadi kesalahan, coba lagi nanti.",e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Toaster />
      <div className="card w-96 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-center">
            <h2 className="text-3xl font-bold">Log in</h2>
          </div>
          <form onSubmit={handleLogin}>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Username</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="Type here"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                type="password"
                className="input w-full"
                placeholder="Type here"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </fieldset>
            <div className="mt-5">
              <button type="submit" className="btn btn-neutral btn-block" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>
          <div>
            <p className="flex justify-center mt-3">
              Don't have an account? <a href="/register" className="text-indigo-600 font-medium">Register</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
