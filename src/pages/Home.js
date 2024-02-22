import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import ListWrapper from "../components/ListWrapper";
import NavBar from "../components/NavBar";
import { useState } from "react";

const initialList = [
  {
    id: "1",
    title: "ToDo",
    items: [
      {
        id: "ToDo-1",
        name: "Learn Piano",
      },
      {
        id: "ToDo-2",
        name: "Play Football",
      },
    ],
  },
  {
    id: "2",
    title: "Doing",
    items: [
      {
        id: "Doing-1",
        name: "Learn React",
      },
    ],
  },
  {
    id: "3",
    title: "Done",
    items: [
      {
        id: "Done-1",
        name: "Learn Guitar",
      },
    ],
  },
];

function Home() {
  const [stores, setStores] = useState(initialList);

  const handleDragAndDrop = (results) => {
    const { source, destination, type } = results;
    console.log({ source, destination, type });
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
      console.log("remove store", removedStore);
      console.log("storeSourceIndex", storeSourceIndex);
      reorderedStores.splice(storeDestinatonIndex, 0, removedStore);

      return setStores(reorderedStores);
    }

    const itemSourceIndex = source.index;
    const itemDestinationIndex = destination.index;

    const storeSourceIndex = stores.findIndex(
      (store) => store.id === source.droppableId
    );
    console.log("storeSourceIndex", storeSourceIndex);
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
    <div className="w-[90%] h-auto bg-[#69dbf3]">
      <DragDropContext onDragEnd={handleDragAndDrop}>
        <NavBar />
        <Droppable droppableId="ROOT" type="group">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex justify-around"
            >
              {stores.map((store, index) => (
                <Draggable draggableId={store.id} index={index} key={store.id}>
                  {(provided) => (
                    <div
                      className="w-full flex justify-around"
                      title={store.title}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <ListWrapper {...store} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Home;