import { faAdd, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function JobItems({ tagName, deleteJob }) {
  return (
    <div>
      <div className="w-90% m-[8px] bg-white px-[4px] py-[8px] flex items-center justify-between">
        <h2>{tagName}</h2>
        <FontAwesomeIcon icon={faTrash} onClick={deleteJob} />
      </div>
    </div>
  );
}

export default JobItems;
