import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ContactContext = createContext(null);

export function ContactProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  const openContact = useCallback(() => {
    setIsOpen(true);
    setRequestKey((k) => k + 1);
  }, []);

  const closeContact = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, openContact, closeContact, requestKey }),
    [isOpen, openContact, closeContact, requestKey]
  );

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact() {
  const context = useContext(ContactContext);
  if (!context) throw new Error("useContact must be used within a ContactProvider");
  return context;
}
