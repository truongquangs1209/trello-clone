import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import ListWrapper from "../components/ListWrapper";
import NavBar from "../components/NavBar";
import { useContext, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faClose } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../context/AuthProvider";
import { addItemToCollection } from "../firebase/services";

function Home() {
  const [titleList, setTitleList] = useState("");
  const [stores, setStores] = useState();
  const [openTextArea, setOpenTextArea] = useState(false);
  const [members, setMembers] = useState([]);

  const {
    user: { email },
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
  }, []);

  useEffect(() => {
    const fetchListJobs = async () => {
      try {
        const listJobsCollection = collection(db, "listJobs");
        const snapshot = await getDocs(listJobsCollection);

        const listJobsDb = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          items: doc.data().item,
        }));
        setStores(listJobsDb);
      } catch (error) {
        console.error("error getting document", error);
      }
    };
    fetchListJobs();
  }, []);

  useEffect(() => {
    const fetchJobsFromFirestore = async () => {
      try {
        const usersCollection = collection(db, "jobs");
        const snapshot = await getDocs(usersCollection);
        const dataArray =
          snapshot.docs &&
          snapshot.docs.map((doc) => ({
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
  }, []);

  const handleTitleTextChange = (e) => {
    setTitleList(e.target.value);
  };

  const handleAddList = async () => {
    try {
      if (titleList) {
        const newList = {
          id: uuidv4(),
          title: titleList,
          items: [],
        };
        addItemToCollection("listJobs", newList, setStores);
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
      const docRef = doc(db, "listJobs", listId);
      await deleteDoc(docRef);
      setStores((prevStores) =>
        prevStores.filter((store) => store.id !== listId)
      );
    } catch (error) {
      console.error("Error deleting document", error);
    }
  };
  console.log(stores);
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
      console.log("reorderdStores", reorderedStores);
      const storeSourceIndex = source.index;
      const storeDestinatonIndex = destination.index;

      const [removedStore] = reorderedStores.splice(storeSourceIndex, 1);
      reorderedStores.splice(storeDestinatonIndex, 0, removedStore);

      return setStores(reorderedStores);
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
    setStores(newStores);
  };

  return (
    <div className="w-[90%] h-auto ]">
      <DragDropContext onDragEnd={handleDragAndDrop}>
        <NavBar />
        <Droppable droppableId="ROOT" type="group">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex justify-around"
            >
              {members.some((member) => member.email === email) &&
                stores &&
                stores.map((store, index) => (
                  <Draggable
                    draggableId={store.id}
                    index={index}
                    key={store.id}
                  >
                    {(provided) => (
                      <div
                        className="w-full flex justify-around"
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
                className="w-[90%] h-fit mr-[1%]  p-2 bg-[#ebecf0] min-w-[20%]  rounded-md mb-8 overflow-hidden"
                style={
                  stores && stores.length < 5
                    ? { display: "block" }
                    : { display: "none" }
                }
                onClick={() => setOpenTextArea(true)}
              >
                <div
                  style={
                    openTextArea
                      ? { display: "flex", flexDirection: "column" }
                      : { display: "none" }
                  }
                >
                  <textarea
                    value={titleList}
                    placeholder="Enter a title for this tag..."
                    className="w-[93%] text-[12px] m-[8px] outline-none p-1"
                    onChange={handleTitleTextChange}
                  ></textarea>
                  <div className="flex justify-around items-center mb-4">
                    <button
                      onClick={() => {
                        handleAddList();
                        setOpenTextArea(false);
                      }}
                      className="bg-[#616167] rounded-md w-[40%] h-7 text-white"
                    >
                      Add list
                    </button>
                    <div onClick={() => setOpenTextArea(false)}>
                      <FontAwesomeIcon icon={faClose} />
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => {
                    setOpenTextArea(true);
                  }}
                  className="flex flex-row items-center cursor-pointer"
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
