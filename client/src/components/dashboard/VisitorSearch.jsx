import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import VisitorTypeSelector from "./VisitorTypeSelector";
import VisitorDropdown from "./VisitorDropdown";
import { searchVisitor, getVisitorNames } from "../../services/visitorService";

const VisitorSearch = ({
  formData,
  onSearchComplete,
  onClearSearch,
  onChange,
}) => {
  const [searchType, setSearchType] = useState("Individual");
  const [options, setOptions] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load options whenever type changes
  useEffect(() => {
    loadVisitorOptions();
  }, [searchType]);

  const loadVisitorOptions = async () => {
    setLoading(true);
    try {
      const data = await getVisitorNames(searchType);
      setOptions(data || []);
    } catch (error) {
      console.error("Failed to fetch visitor options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorChange = async (visitor) => {
    setSelectedVisitor(visitor);

    if (!visitor) {
      // If cleared, reset parent
      if (onClearSearch) onClearSearch();
      onSearchComplete({ type: searchType, results: [] });
      return;
    }

    const params =
      searchType === "Individual"
        ? {
            visitorType: "Individual",
            firstName: visitor.firstName,
            lastName: visitor.lastName,
          }
        : {
            visitorType: "Group",
            groupName: visitor.groupName,
          };

    try {
      const results = await searchVisitor(params);
      onSearchComplete({ type: searchType, results: results || [] });
    } catch (error) {
      console.error("Search failed:", error);
      onSearchComplete({ type: searchType, results: [] });
    }
  };

  return (
    <Form>
      <VisitorTypeSelector
        selectedType={searchType}
        onChange={(type) => {
          setSearchType(type);
          setSelectedVisitor(null);
          onSearchComplete({ type, results: [] });
        }}
      />

      <VisitorDropdown
        searchType={searchType}
        options={options}
        loading={loading}
        selectedVisitor={selectedVisitor}
        onChange={handleVisitorChange}
      />
    </Form>
  );
};

export default VisitorSearch;
