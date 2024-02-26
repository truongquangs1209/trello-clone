import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JobItems from "./JobItems";
import { faAdd, faClose } from "@fortawesome/free-solid-svg-icons";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase/config";
import {
  getDocs,
  addDoc,
  collection,
  doc,
  deleteDoc,
} from "firebase/firestore";

function ListWrapper({ id, title, items, setItems }) {
  const [data, setData] = useState([]);
  const [openTextArea, setOpenTextArea] = useState(false);
  const [titleText, setTitleText] = useState("");

  // console.log(data);
  const handleTitleTextChange = (e) => {
    setTitleText(e.target.value);
  };

  const handleAddTag = async () => {
    const jobsCollection = collection(db, "jobs");
    if (titleText) {
      const newItem = { id: uuidv4(), name: titleText, type: title };
      const docRef = await addDoc(jobsCollection, newItem);
      console.log("Document written with ID: ", docRef.id);
      items.push(newItem);
      setTitleText("");
    } else {
      alert("Vui lòng nhập giá trị");
    }
  };
  console.log(items);
  const handleDeleteJobItem = async (documentId) => {
    try {
      const documentRef = doc(db, "jobs", documentId);
      await deleteDoc(documentRef);

      // Cập nhật state data ngay lập tức và xóa dữ liệu trên Firebase
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== documentId)
      );

      console.log("Document deleted with id", documentRef.id);
    } catch (error) {
      console.error("Error deleting document", error);
    }
  };

  console.log(data);
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="w-[90%] bg-[#ebecf0] rounded-md mb-8 overflow-hidden flex flex-col"
        >
          <h2 className="m-[8px] font-medium">{title}</h2>
          <div>
            {items &&
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
            <p className="text-[#cfd7e1]  font-bold pl-1">Add Tag</p>
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default ListWrapper;
