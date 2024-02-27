import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

function Login() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const handleLoginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    console.log({ res });
  };

  if (user?.uid) {
    navigate("/");
    return;
  }
  console.log(user);
  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <h1 className="text-center mb-6">Login</h1>
      <button
        className="w-[30%] h-[40px] rounded-lg bg-blue-700 text-white"
        onClick={handleLoginWithGoogle}
      >
        Login with Google
      </button>
    </div>
  );
}

export default Login;
