import React, { useContext, useEffect, useState } from "react";
import { Form, Modal, Select, Spin, Avatar, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { db } from "../firebase/config";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../context/AuthProvider";

function InviteMember() {
  const [form] = Form.useForm();
  const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);
  const [value, setValue] = useState([]);
  const [options, setOptions] = useState([]);
  const [members, setMembers] = useState([]);

  const {
    user: { displayName, photoURL, email },
  } = useContext(AuthContext);
  //   console.log(displayName);

  const handleClick = () => {
    setIsInviteMemberVisible(true);
  };

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
    const fetchUserList = async () => {
      try {
        const userCollection = collection(db, "users");
        const snapshot = await getDocs(userCollection);
        const userList = snapshot.docs.map((doc) => ({
          label: doc.data().displayName,
          value: doc.data().uid,
          photoURL: doc.data().photoURL,
          email: doc.data().email,
        }));

        setOptions(userList);
      } catch (error) {
        console.error("error getting document", error);
      }
    };
    fetchUserList();
  }, [members]);
  //   console.log(options);

  //   console.log(options);
  const handleOk = () => {
    const memberCollection = collection(db, "member");
    value.forEach(async (selectedValue) => {
      const selectedUser = options.find((user) => user.value === selectedValue);
      await addDoc(memberCollection, {
        userId: selectedValue,
        email: selectedUser.email,
        photoURL: selectedUser.photoURL,
      });
      setMembers([...members, selectedUser]);
    });

    form.resetFields();
    setValue([]);
    setIsInviteMemberVisible(false);
  };
  //   console.log(value);
  const handleCancel = () => {
    form.resetFields();
    setValue([]);
    setIsInviteMemberVisible(false);
  };
  //   console.log(members);
  return (
    <div className="flex items-center justify-between">
      <div
        onClick={() => handleClick()}
        className="border text-[12px] border-solid mr-4 border-black p-1 rounded-xl hover:bg-gray-400 transition-all"
      >
        <FontAwesomeIcon icon={faUserPlus} />
        <span>Mời</span>
      </div>
      <Avatar.Group size="small" maxCount={2}>
        {members.map((member) => (
          <Tooltip key={member.email} title={member.email}>
            <Avatar src={member.photoURL}></Avatar>
          </Tooltip>
        ))}
      </Avatar.Group>
      <div>
        <Modal
          title="Mời thêm thành viên"
          open={isInviteMemberVisible}
          destroyOnClose={true}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form layout="vertical">
            <Select
              mode="multiple"
              name="search-user"
              label="Tên các thành viên"
              value={value}
              placeholder="Nhập tên thành viên"
              showSearch
              filterOption={false}
              onChange={(newValue) => setValue(newValue)}
              style={{ width: "100%" }}
              //   options={options}
            >
              {options &&
                options.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    <Avatar size="small" src={opt.photoURL}>
                      {opt.photoURL ? "" : opt.label.charAt(0)?.toUpperCase()}
                    </Avatar>
                    {opt.label}
                  </Select.Option>
                ))}
            </Select>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export default InviteMember;
