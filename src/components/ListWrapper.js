import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JobItems from "./JobItems";
import { faAdd, faClose } from "@fortawesome/free-solid-svg-icons";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthProvider";

function ListWrapper({ id, title, items }) {
  const [data, setData] = useState(items);
  const [openTextArea, setOpenTextArea] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [members, setMembers] = useState([]);

  const {
    user: { displayName, photoURL, email },
  } = useContext(AuthContext);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const memberCollection = collection(db, "member");
        const snapshot = await getDocs(memberCollection);

        const memberList = snapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          email: doc.data().email,
          photoURL: doc.data().photoURL,
        }));

        setMembers(memberList);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, [data]);

  console.log(email);
  console.log(members);

  const handleTitleTextChange = (e) => {
    setTitleText(e.target.value);
  };

  const handleAddTag = async () => {
    const jobsCollection = collection(db, "jobs");
    if (titleText) {
      const newItem = { name: titleText, type: title };
      const docRef = await addDoc(jobsCollection, newItem);
      console.log("Document written with ID: ", docRef.id);
      items.push({ id: docRef.id, ...newItem });
      setData((prevData) => [...prevData, { id: docRef.id, ...newItem }]);
      setTitleText("");
    } else {
      alert("Vui lòng nhập giá trị");
    }
  };

  const handleDeleteJobItem = async (documentId) => {
    try {
      const documentRef = doc(db, "jobs", documentId);
      await deleteDoc(documentRef);

      const indexToRemove = items.findIndex((item) => item.id === documentId);
      console.log(data);
      console.log(items);
      setData(items.splice(indexToRemove, 1));

      console.log("Document deleted with id", documentRef.id);
    } catch (error) {
      console.error("Error deleting document", error);
    }
  };

  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="w-[90%] bg-[#ebecf0] h-fit min-w-[20%] rounded-md mb-8 overflow-hidden flex flex-col"
        >
          <h2 className="m-[8px] font-medium">{title}</h2>
          <div>
            {members.some((member) => member.email === email) &&
              items.map((item, index) => (
                <Draggable draggableId={item.id} index={index} key={item.id}>
                  {(provided) => (
                    <div
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <JobItems
                        deleteJob={() => {
                          handleDeleteJobItem(item.id);
                        }}
                        tagName={item.name}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
          <div
            style={!openTextArea ? { display: "none" } : { display: "block" }}
          >
            <textarea
              value={titleText}
              placeholder="Enter a title for this tag..."
              className="w-[93%] text-[12px] m-[8px] outline-none p-1"
              onChange={handleTitleTextChange}
            ></textarea>
            <div className="flex justify-around items-center mb-4">
              <button
                onClick={handleAddTag}
                className="bg-[blue] rounded-md w-[40%] h-7 text-white"
              >
                Add tag
              </button>
              <div
                onClick={() => {
                  setOpenTextArea(false);
                }}
              >
                <FontAwesomeIcon icon={faClose} />
              </div>
            </div>
          </div>
          <div
            className="bg-transparent text-[#c0c7d0] transition hover:bg-[#c3c6c3] hover:text-white flex items-center w-[93%] m-[8px] px-[4px] py-[8px]"
            style={openTextArea ? { display: "none" } : { display: "flex" }}
            onClick={() => {
              setOpenTextArea(true);
            }}
          >
            <FontAwesomeIcon icon={faAdd} />
            <p className="text-[#cfd7e1] font-medium text-[12px] pl-1">
              Add Tag
            </p>
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default ListWrapper;
