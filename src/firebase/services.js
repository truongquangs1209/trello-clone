import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";
import { useEffect } from "react";

export const useDataFetching = (
  setData,
  collectionName,
  filterData,
  dependencyArray
) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(db, collectionName);
        const snapshot = await getDocs(dataCollection);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(filterData ? filterData : data);
      } catch (error) {
        console.error(`Error fetching data from ${collectionName}:`, error);
      }
    };
    fetchData();
  }, [dependencyArray]);
};

// api.js

export const addItemToCollection = async (
  collectionName,
  data,
  setCollection,
  items
) => {
  try {
    const dataCollection = collection(db, collectionName);
    const docRef = await addDoc(dataCollection, data);
    items.push({ id: docRef.id, ...data });
    data.id = docRef.id;

    //

    if (setCollection) {
      // Nếu setCollection được truyền vào, cập nhật state hoặc dữ liệu liên quan
      setCollection((prevData) => [...prevData, { id: docRef.id, ...data }]);
    }

    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding item to collection:", error);
  }
};

export const deleteItem = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};
