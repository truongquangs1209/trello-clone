import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

function NavBar() {
  const {
    user: { displayName, photoURL, auth },
  } = useContext(AuthContext);
  // console.log({ displayName, photoURL, auth });

  return (
    <div className="flex bg-[#6ebaf8] mx-3 my-3 items-center justify-between">
      <h1>NavBar</h1>
      <div className="flex items-center">
        <img
          width={30}
          height={30}
          className="rounded-[50%] my-4"
          src={photoURL}
          alt="img"
        />
        <span className="text-[14px] ml-[6px]">{displayName}</span>
      </div>
    </div>
  );
}

export default NavBar;
