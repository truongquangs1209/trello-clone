import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

function NavBar() {
  const {
    user: { displayName, photoURL, auth },
  } = useContext(AuthContext);

  return (
    <div className="flex rounded-xl bg-[#00aede] mx-3 my-3 px-2 items-center justify-between">
      <div className="flex items-center justify-center">
        <h1 className="text-lg font-bold">My Trello</h1>
        <FontAwesomeIcon icon={faStar} />
      </div>
      <div className="flex items-center">
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
        <button
          className="text-[12px] p-1 h-fit ml-[6px] border border-solid border-[#ccc]"
          onClick={() => {
            auth.signOut();
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default NavBar;
