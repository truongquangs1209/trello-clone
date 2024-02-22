import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function JobItems({ tagName }) {
  return (
    <div>
      <div className="w-90% m-[8px] bg-white px-[4px] py-[8px]">{tagName}</div>
    </div>
  );
}

export default JobItems;
