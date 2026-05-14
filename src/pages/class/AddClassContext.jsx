import React, { createContext, useContext } from "react";

const AddClassModalContext = createContext({ openAddClass: () => {}, closeAddClass: () => {} });

export const AddClassModalProvider = ({ openAddClass, closeAddClass, children }) => {
  return (
    <AddClassModalContext.Provider value={{ openAddClass, closeAddClass }}>
      {children}
    </AddClassModalContext.Provider>
  );
};

export const useAddClassModal = () => useContext(AddClassModalContext);

export default AddClassModalContext;
