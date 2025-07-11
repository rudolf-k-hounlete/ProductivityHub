import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import * as Icons from "lucide-react";

interface SearchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Search: React.FC<SearchProps> = ({ isOpen, setIsOpen }) => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const allData = [
        ...state.tasks.map((item) => ({ ...item, type: "Task" })),
        ...state.projects.map((item) => ({ ...item, type: "Project" })),
        ...state.notes.map((item) => ({ ...item, type: "Note" })),
        ...state.events.map((item) => ({ ...item, type: "Event" })),
      ];

      const filteredData = allData.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filteredData);
    } else {
      setResults([]);
    }
  }, [searchTerm, state]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Search</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search across all modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="mt-4 max-h-96 overflow-y-auto">
          {results.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-100">
              <p className="font-semibold">{item.title || item.name}</p>
              <p className="text-sm text-gray-500">{item.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
