import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function Login() {
  const auth = getAuth();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleLoginWithGoogle = async () => {
    // const {additionnalUserInfo, user} = await auth.signInWithPopup(go)
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      console.log({ res });
      const user = res.user;
      const { displayName, email, uid, photoURL } = user;
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        displayName,
        email,
        uid,
        photoURL,
      });

      console.log(
        "Đăng nhập thành công và lưu thông tin người dùng vào Firestore"
      );
    } catch (error) {
      console.error("Đăng nhập không thành công:", error);
    }

    if (user?.uid) {
      navigate("/");
      return;
    }
    console.log(user);
  };
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
