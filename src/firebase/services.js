import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./config";

export const fetchData = async (collectionName, data, setState) => {
  try {
    const dataCollection = collection(db, collectionName);
    const snapshot = await getDocs(dataCollection);

    const listData = snapshot.docs.map((doc) => ({
      ...data,
    }));
    setState(listData);
  } catch (error) {
    console.log("Error fetching data:", error);
  }
};
fetchData();

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

    if (setCollection) {
      // Nếu setCollection được truyền vào, cập nhật state hoặc dữ liệu liên quan
      setCollection((prevData) => [...prevData, { id: docRef.id, ...data }]);
    }

    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding item to collection:", error);
  }
};
