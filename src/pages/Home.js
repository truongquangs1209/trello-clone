import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import ListWrapper from "../components/ListWrapper";
import NavBar from "../components/NavBar";
import { useContext, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faClose } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthProvider";
import { deleteItem, useDataFetching } from "../firebase/services";

function Home() {
  const [titleList, setTitleList] = useState("");
  const [stores, setStores] = useState();
  const [openTextArea, setOpenTextArea] = useState(false);
  const [members, setMembers] = useState([]);

  const {
    user: { email },
  } = useContext(AuthContext);

  //fetching data member
  useDataFetching(setMembers, "member");

  //fetching data listJobs
  useDataFetching(setStores, "listJobs");

  useEffect(() => {
    const fetchJobsFromFirestore = async () => {
      try {
        const usersCollection = collection(db, "jobs");
        const snapshot = await getDocs(usersCollection);
        const dataArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStores((prevStores) =>
          prevStores.map((store) => {
            const filteredData = dataArray.filter(
              (data) => data.type === store.title
            );
            return {
              ...store,
              items: filteredData,
            };
          })
        );
      } catch (error) {
        console.error("error getting document", error);
      }
    };
    fetchJobsFromFirestore();
  }, [members]);

  const handleAddList = async () => {
    try {
      if (titleList) {
        const newList = {
          title: titleList,
          items: [],
        };
        const dataCollection = collection(db, "listJobs");
        const docRef = await addDoc(dataCollection, newList);
        newList.id = docRef.id;
        setStores([...stores, newList]);
        setOpenTextArea(false);
      }
      setTitleList("");
    } catch (error) {
      console.log(error);
    }
  };

  const updateItemTypeInFirestore = async (itemId, newType) => {
    try {
      const itemDocRef = doc(db, "jobs", itemId);
      await updateDoc(itemDocRef, { type: newType });
      console.log("Item type updated successfully!");
    } catch (error) {
      console.error("Error updating item type:", error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      deleteItem("listJobs", listId);
      setStores((prevStores) =>
        prevStores.filter((store) => store.id !== listId)
      );
    } catch (error) {
      console.error("Error deleting document", error);
    }
  };

  const handleDragAndDrop = async (results) => {
    const { source, destination, type } = results;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "group") {
      const reorderedStores = [...stores];
      console.log("reorderedStores", reorderedStores);
      const storeSourceIndex = source.index;
      const storeDestinatonIndex = destination.index;

      const [removedStore] = reorderedStores.splice(storeSourceIndex, 1);
      reorderedStores.splice(storeDestinatonIndex, 0, removedStore);

      setStores([...reorderedStores]);
      return;
    }

    const itemSourceIndex = source.index;
    const itemDestinationIndex = destination.index;

    const storeSourceIndex = stores.findIndex(
      (store) => store.id === source.droppableId
    );
    const storeDestinationIndex = stores.findIndex(
      (store) => store.id === destination.droppableId
    );

    const newSourceItems = [...stores[storeSourceIndex].items];
    const newDestinationItems =
      source.droppableId !== destination.droppableId
        ? [...stores[storeDestinationIndex].items]
        : newSourceItems;

    const [deletedItem] = newSourceItems.splice(itemSourceIndex, 1);
    newDestinationItems.splice(itemDestinationIndex, 0, deletedItem);

    const itemIdToUpdate = deletedItem.id;
    const newType = stores[storeDestinationIndex].title;

    // Cập nhật type trên server khi kéo thả
    updateItemTypeInFirestore(itemIdToUpdate, newType);

    const newStores = [...stores];

    newStores[storeSourceIndex] = {
      ...stores[storeSourceIndex],
      items: newSourceItems,
    };
    newStores[storeDestinationIndex] = {
      ...stores[storeDestinationIndex],
      items: newDestinationItems,
    };

    setStores([...newStores]);
  };
  console.log(openTextArea);
  return (
    <div className="w-[90%] h-auto ]">
      <DragDropContext onDragEnd={handleDragAndDrop}>
        <NavBar stores={stores} setStores={setStores} />
        <Droppable droppableId="ROOT" type="group">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex"
            >
              {members.some((member) => member.email === email) &&
                stores?.map((store, index) => (
                  <Draggable
                    draggableId={store.id}
                    index={index}
                    key={store.id}
                  >
                    {(provided) => (
                      <div
                        className="w-[25%] flex justify-around"
                        title={store.title}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                      >
                        <ListWrapper
                          {...store}
                          setItems={setStores}
                          handleDeleteList={() => {
                            handleDeleteList(store.id);
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
              <div
                className="w-[25%] h-fit mr-[1%]  p-2 bg-[#ebecf0] min-w-[20%]  rounded-md mb-8 overflow-hidden"
                style={
                  members.some((member) => member.email === email) &&
                  stores &&
                  stores.length < 5
                    ? { display: "block" }
                    : { display: "none" }
                }
              >
                <div
                  style={
                    openTextArea
                      ? { display: "flex", flexDirection: "column" }
                      : { display: "none" }
                  }
                >
                  <input
                    value={titleList}
                    placeholder="Enter a title for this tag..."
                    className="w-[93%] text-[12px] m-[8px] outline-none p-1"
                    onChange={(e) => setTitleList(e.target.value)}
                  ></input>
                  <div className="flex justify-around items-center mb-4">
                    <button
                      onClick={() => {
                        handleAddList();
                        setOpenTextArea(false);
                      }}
                      className="bg-[#b8b8be] hover:bg-[#a5a5af] transition-all rounded-md w-[40%] h-7 text-white"
                    >
                      Add list
                    </button>
                    <div
                      className="cursor-pointer hover:bg-[#ccc] px-1 transition-all"
                      onClick={() => {
                        setOpenTextArea(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faClose} />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setOpenTextArea(true);
                  }}
                  className=" flex flex-row items-center cursor-pointer"
                  style={
                    openTextArea ? { display: "none" } : { display: "flex" }
                  }
                >
                  <FontAwesomeIcon className="mr-1" icon={faAdd} />
                  <h2 className="text-xs">Add New List</h2>
                </div>
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Home;
