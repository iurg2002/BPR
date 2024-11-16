import React, { useState, useEffect, useRef } from "react";
import { Form, ListGroup } from "react-bootstrap";

interface SearchComponentProps {
  addresses: string[];
  onSelectAddress: (address: string) => void;
  exactMatch?: boolean;
  checkAgainst?: string;
  fieldValue?: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  addresses,
  onSelectAddress,
  exactMatch = false,
  checkAgainst = "",
  fieldValue = "",
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(fieldValue);
  const [filteredAddresses, setFilteredAddresses] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Update validity when `addresses` or `searchTerm` changes
    if (addresses.length <= 1) {
      setIsValid(true); // Always valid if list is empty or has one item
    } else if (exactMatch) {
      setIsValid(addresses.includes(searchTerm));
    } else {
      setIsValid(true); // Freeform input is valid when exactMatch is false
    }
  }, [addresses, searchTerm, exactMatch]);

  useEffect(() => {
    setSearchTerm(fieldValue || ""); // Sync search term with external `fieldValue`
  }, [fieldValue]);

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setFilteredAddresses([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    // Filter addresses based on the term
    const filtered = addresses.filter((address) =>
      address.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredAddresses(filtered);

    // Directly update validity for one or fewer items
    if (addresses.length <= 1) {
      setIsValid(true);
      onSelectAddress(term);

    } else if (exactMatch) {
      setIsValid(addresses.includes(term));
    } else {
      setIsValid(true);
    }

    if (!exactMatch) {
      onSelectAddress(term); // Freeform input passes value directly
    }
  };

  const handleAddressClick = (address: string) => {
    onSelectAddress(address);
    setSearchTerm(address);
    setFilteredAddresses([]);
    setIsValid(true); // Valid selection
  };

  return (
    <div ref={searchRef}>
      <Form.Control
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        className={isValid ? "" : "is-invalid"}
      />
      {filteredAddresses.length > 0 && (
        <ListGroup className="position-absolute" style={{ zIndex: 1, width: "100%" }}>
          {filteredAddresses.map((address, index) => (
            <ListGroup.Item
              key={index}
              action
              onClick={() => handleAddressClick(address)}
            >
              {address}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default SearchComponent;
