import React, { useState, useEffect, useRef } from 'react';
import { Col, Form, ListGroup } from 'react-bootstrap';

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
  const prevCheckAgainst = useRef<string | undefined>(checkAgainst);

  useEffect(() => {
    // Check if the entered value is in the list when checkAgainst changes and it's true
    if (checkAgainst && checkAgainst !== prevCheckAgainst.current) {
      if (addresses.length > 0) {
        setIsValid(exactMatch ? addresses.includes(searchTerm) : true);
      } else {
        setIsValid(true); // If addresses list is empty, consider the value valid
      }
      prevCheckAgainst.current = checkAgainst;
    }
  }, [checkAgainst, addresses, exactMatch, searchTerm]);

  useEffect(() => {
    setSearchTerm(fieldValue || ""); // Update the search term when the fieldValue changes
  }, [fieldValue]);

  useEffect(() => {
    // Function to handle clicks outside the search component
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Clicked outside the search component, hide the list
        setFilteredAddresses([]);
      }
    };

    // Add event listener for clicks on the document
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (addresses.length > 0) {
      // Filter addresses based on search term
      const filtered = addresses.filter((address) =>
        address.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredAddresses(filtered);

      // Check if the entered value is in the list
      setIsValid(exactMatch ? addresses.includes(term) : true);
    } else {
      onSelectAddress(term);
    }
  };

  const handleAddressClick = (address: string) => {
    if (exactMatch && !addresses.includes(address)) {
      // If exactMatch is true and the selected address is not in the list, do nothing
      return;
    }
    onSelectAddress(address);
    setSearchTerm(address);
    setFilteredAddresses([]);
    setIsValid(true); // Reset isValid to true after a selection is made
  };

  return (
    <div ref={searchRef}>
      <Form.Control
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        className={isValid ? "" : "is-invalid"} // Add "is-invalid" class if the value is not in the list
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
