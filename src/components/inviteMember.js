import React, { useEffect, useState } from "react";
import { Form, Modal, Select, Avatar, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { db } from "../firebase/config";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useDataFetching } from "../firebase/services";

function InviteMember() {
  const [form] = Form.useForm();
  const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);
  const [value, setValue] = useState([]);
  const [options, setOptions] = useState([]);
  const [members, setMembers] = useState([]);

  const handleClick = () => {
    setIsInviteMemberVisible(true);
  };

  //Fetching data member
  useDataFetching(setMembers, "member");

  //Fetching data users
  // useDataFetching(setOptions, "users", members);

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

  const filterMember = options.filter(
    (opt) => !members.find((member) => member.userId === opt.value)
  );

  const handleOk = () => {
    const memberCollection = collection(db, "member");
    value.forEach(async (selectedValue) => {
      const selectedUser = options.find((user) => user.value === selectedValue);
      await addDoc(memberCollection, {
        userId: selectedValue,
        email: selectedUser.email,
        photoURL: selectedUser.photoURL,
      });
      window.location.reload();
      setMembers([...members, selectedUser]);
    });

    form.resetFields();
    setValue([]);
    setIsInviteMemberVisible(false);
  };

  const handleCancel = () => {
    form.resetFields();
    setValue([]);
    setIsInviteMemberVisible(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div
        onClick={() => handleClick()}
        className="border text-[12px] border-solid mr-4 border-black p-1 rounded-xl hover:bg-gray-400 transition-all"
      >
        <FontAwesomeIcon icon={faUserPlus} />
        <span>Tham gia</span>
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
            >
              {filterMember &&
                filterMember.map((opt) => (
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
