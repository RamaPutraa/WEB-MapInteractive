import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:1126/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registrasi berhasil! Silakan login.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Terjadi kesalahan, coba lagi nanti.");
      console.error(e);
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
            <h2 className="text-3xl font-bold">Register</h2>
          </div>
          <form onSubmit={handleRegister}>
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
              <legend className="fieldset-legend">Email Address</legend>
              <input
                type="email"
                className="input w-full"
                placeholder="Type here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </fieldset>
            <div className="grid grid-cols-2 gap-4">
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
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Confirm Password</legend>
              <input
                type="password"
                className="input w-full"
                placeholder="Type here"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </fieldset>
            </div>
            <div className="mt-5">
              <button type="submit" className="btn btn-neutral btn-block" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
          <div>
            <p className="flex justify-center mt-3">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 font-medium">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
