import React from "react";
import Tabs from "../../../component/Tabs";
import { NotificationDot } from "../../../components/NotificationIndicators";

const ClassTabs = ({ activeKey, onSelect, notifications = {} }) => {
  const items = [
    {
      key: "assignments",
      label: (
        <span className="d-inline-flex align-items-center">
          Assignments
          {notifications.assignments && <NotificationDot />}
        </span>
      ),
    },
    {
      key: "chat",
      label: (
        <span className="d-inline-flex align-items-center">
          Chat
          {notifications.chat && <NotificationDot />}
        </span>
      ),
    },
    {
      key: "classmates",
      label: (
        <span className="d-inline-flex align-items-center">
          Classmates
          {notifications.classmates && <NotificationDot />}
        </span>
      ),
    },
  ];
  return (
    <Tabs items={items} activeKey={activeKey} onSelect={onSelect} className="cc-class-tabs"/>
  );
};

export default ClassTabs;
