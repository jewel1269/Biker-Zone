import React, { useState, useEffect, useMemo } from "react";
import {
  FiChevronDown,
  FiPlus,
  FiSearch,
  FiChevronRight,
} from "react-icons/fi";
import { BsCheckSquareFill, BsSquare } from "react-icons/bs";
import { IoMdLock } from "react-icons/io";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useTranslation } from "react-i18next";

const ModelSelector = ({
  selectedModel,
  selectedModels,
  setSelectedModels,
  isModelSelectOpen,
  setIsModelSelectOpen,
  modelSelectRef,
  minimized,
}) => {
  const activeModel = selectedModels[0];
  const [isAddMode, setIsAddMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeTag, setActiveTypeTag] = useState("all");
  const [expandedCompany, setExpandedCompany] = useState(null);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    const stored = localStorage.getItem("aiEmulator_favoriteModels");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const toggleFavorite = (modelId) => {
    const next = favorites.includes(modelId)
      ? favorites.filter((id) => id !== modelId)
      : [...favorites, modelId].slice(-5);
    setFavorites(next);
    localStorage.setItem("aiEmulator_favoriteModels", JSON.stringify(next));
  };

  const isFavorite = (modelId) => favorites.includes(modelId);

  const typeTags = useMemo(() => {
    const types = [
      ...new Set(selectedModel.models.map((m) => m.type).filter(Boolean)),
    ];
    return ["all", ...types];
  }, [selectedModel.models]);

  const tagLabel = (tag) => {
    if (tag === "all") return "Bina";
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  const triggerPillLabel = (tag) => {
    if (tag === "all") return "Bina Model";
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  };

  const tagFilteredModels = useMemo(() => {
    if (activeTypeTag === "all") return selectedModel.models;
    return selectedModel.models.filter((m) => m.type === activeTypeTag);
  }, [selectedModel.models, activeTypeTag]);

  const companiesInView = useMemo(() => {
    const map = {};
    tagFilteredModels.forEach((m) => {
      const company = m.info?.developer || "Other";
      if (!map[company]) map[company] = [];
      map[company].push(m);
    });
    return map;
  }, [tagFilteredModels]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return tagFilteredModels.filter(
      (m) =>
        m.info?.name?.toLowerCase().includes(q) ||
        m.info?.developer?.toLowerCase().includes(q),
    );
  }, [tagFilteredModels, searchQuery]);

  const isSearchMode = searchQuery.length > 0;

  const handleModelClick = (modelOption) => {
    if (modelOption.disabled) return;
    if (isAddMode) {
      const isSelected = selectedModels.some(
        (m) => m.model === modelOption.model,
      );
      if (isSelected) {
        if (selectedModels.length > 1)
          setSelectedModels(
            selectedModels.filter((m) => m.model !== modelOption.model),
          );
      } else if (selectedModels.length < 4) {
        setSelectedModels([...selectedModels, { ...modelOption }]);
      }
      return;
    }
    setSelectedModels([{ ...modelOption }]);
    setIsModelSelectOpen(false);
    setIsAddMode(false);
  };

  const handleCompanyClick = (company) => {
    setExpandedCompany((prev) => (prev === company ? null : company));
  };

  const isModelSelected = (modelOption) =>
    selectedModels.some((m) => m.model === modelOption.model);

  const openAddMode = () => {
    setIsAddMode(true);
    setIsModelSelectOpen(true);
  };
  const openSwitchMode = () => {
    setIsAddMode(false);
    setIsModelSelectOpen(true);
  };

  useEffect(() => {
    if (!isModelSelectOpen || isAddMode) return;
    const t = activeModel?.type;
    if (t && typeTags.includes(t)) setActiveTypeTag(t);
    else setActiveTypeTag("all");
  }, [isModelSelectOpen, isAddMode, activeModel?.model, activeModel?.type, typeTags]);

  const toggleDropdown = () => {
    if (isModelSelectOpen) {
      setIsModelSelectOpen(false);
      setIsAddMode(false);
    } else {
      openSwitchMode();
    }
  };

  useEffect(() => {
    if (!isModelSelectOpen) {
      setSearchQuery("");
      setActiveTypeTag("all");
      setExpandedCompany(null);
    }
  }, [isModelSelectOpen]);

  useEffect(() => {
    setExpandedCompany(null);
  }, [activeTypeTag]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modelSelectRef.current &&
        !modelSelectRef.current.contains(event.target) &&
        isModelSelectOpen
      ) {
        setIsModelSelectOpen(false);
        setIsAddMode(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModelSelectOpen, modelSelectRef]);

  const renderModelRow = (modelOption) => {
    const selected = isModelSelected(modelOption);
    const isCurrent = activeModel?.model === modelOption.model;
    const favorite = isFavorite(modelOption.model);

    return (
      <div
        key={modelOption.model}
        onClick={() => handleModelClick(modelOption)}
        className={`border-b border-[#E8E8E8] last:border-0 ${
          isCurrent && !isAddMode ? "bg-[#F5F5F5]" : ""
        } ${selected && isAddMode ? "bg-[#F0F0F0]" : ""} ${
          modelOption.disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer"
        }`}
      >
        <div
          className={`flex flex-col px-3 py-2 transition-colors ${!modelOption.disabled ? "hover:bg-[#FAFAFA]" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={`truncate text-sm text-[#1a1a1a] ${(isCurrent && !isAddMode) || (selected && isAddMode) ? "font-medium" : ""}`}
              >
                {modelOption?.info?.name}
              </span>
              {modelOption.disabled && (
                <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  <IoMdLock className="h-3 w-3" />
                  <span>Soon</span>
                </span>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-1.5">
              {!modelOption.disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(modelOption.model);
                  }}
                  className="rounded p-0.5 transition-colors hover:bg-[#EEEEEE]"
                >
                  {favorite ? (
                    <AiFillStar
                      className="h-3.5 w-3.5"
                      style={{ color: selectedModel.color }}
                    />
                  ) : (
                    <AiOutlineStar className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>
              )}
              {isAddMode ? (
                selected ? (
                  <BsCheckSquareFill
                    className="h-3.5 w-3.5"
                    style={{ color: selectedModel.color }}
                  />
                ) : (
                  <BsSquare className="h-3.5 w-3.5 text-gray-400" />
                )
              ) : (
                isCurrent && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: selectedModel.color }}
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )
              )}
            </div>
          </div>
          {modelOption?.info?.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
              {modelOption.info.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderCompanyRow = (company, models) => {
    const isExpanded = expandedCompany === company;
    return (
      <div key={company}>
        <div
          onClick={() => handleCompanyClick(company)}
          className="flex cursor-pointer items-center justify-between border-b border-[#E8E8E8] px-3 py-2.5 transition-colors hover:bg-[#FAFAFA]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-8 w-8 flex-shrink-0 rounded-full bg-[#C4C4C4]"
              aria-hidden
            />
            <span className="truncate text-sm font-medium text-[#1a1a1a]">
              {company}
            </span>
          </div>
          <FiChevronRight
            className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          />
        </div>

        {isExpanded && (
          <div className="border-b border-[#E8E8E8] bg-[#F9F9F9]">
            {models.map((m) => renderModelRow(m))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={modelSelectRef}>
        {/* Dark pill trigger bar (matches design) */}
        <div
          className={`flex items-center gap-1 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] px-1.5 py-1 shadow-sm ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div
            className={`flex flex-1 flex-wrap items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {typeTags.map((tag) => {
              const active = activeTypeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTypeTag(tag);
                    setIsAddMode(false);
                    setIsModelSelectOpen(true);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-[#3d3d3d] bg-[#2d2d2d] text-white"
                      : "border-[#333333] bg-[#262626] text-gray-200 hover:bg-[#2a2a2a]"
                  }`}
                >
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: active ? "#EF4444" : "#7DD3FC",
                    }}
                    aria-hidden
                  />
                  {triggerPillLabel(tag)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-[#2d2d2d] hover:text-white"
            aria-haspopup="listbox"
            aria-expanded={isModelSelectOpen && !isAddMode}
            title={activeModel?.info?.name}
          >
            <FiChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isModelSelectOpen && !isAddMode ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {isModelSelectOpen && (
          <div
            className={`absolute ${isRTL ? "left-0" : "right-0"} bottom-full z-10 mb-2 w-80 overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-xl`}
            role="listbox"
          >
            <div className="sticky top-0 z-[3] border-b border-[#E8E8E8] bg-white p-3">
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full rounded-lg border border-[#E0E0E0] bg-white py-2 pl-3 pr-10 text-sm text-[#1a1a1a] placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
                <span
                  className={`pointer-events-none absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#E8E8E8] ${isRTL ? "left-2" : "right-2"}`}
                >
                  <FiSearch className="h-3.5 w-3.5 text-gray-500" />
                </span>
              </div>

              <div
                className={`flex flex-wrap gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {typeTags.map((tag) => {
                  const active = activeTypeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTypeTag(tag)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-[#BDBDBD] text-[#1a1a1a]"
                          : "bg-[#EEEEEE] text-[#1a1a1a]"
                      }`}
                    >
                      {tagLabel(tag)}
                    </button>
                  );
                })}
              </div>

              {isAddMode && (
                <p
                  className={`mt-2 text-xs text-gray-500 ${isRTL ? "text-left" : "text-right"}`}
                >
                  {selectedModels.length}/4
                </p>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isSearchMode ? (
                searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No models found
                  </div>
                ) : (
                  searchResults.map((m) => renderModelRow(m))
                )
              ) : Object.keys(companiesInView).length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  No models for this type
                </div>
              ) : (
                Object.entries(companiesInView)
                  .filter(
                    ([company]) =>
                      !expandedCompany || expandedCompany === company,
                  )
                  .map(([company, models]) =>
                    renderCompanyRow(company, models),
                  )
              )}
            </div>

            {!isAddMode && selectedModels.length > 1 && (
              <div className="border-t border-[#E8E8E8] px-3 py-1.5 text-xs text-orange-500">
                Switching replaces all {selectedModels.length} selected models
              </div>
            )}
          </div>
        )}
      </div>

      {!minimized && (
        <button
          type="button"
          onClick={openAddMode}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-[#CCCCCC] text-gray-500 transition-all hover:bg-[#F5F5F5] hover:text-[#1a1a1a]"
          title="Add model for comparison"
        >
          <FiPlus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ModelSelector;
