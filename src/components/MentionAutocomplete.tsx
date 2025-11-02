import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, FileText } from "lucide-react";

interface MentionAutocompleteProps {
  content: string;
  onMentionSelect: (mention: string) => void;
  isOpen: boolean;
}

export function MentionAutocomplete({
  content,
  onMentionSelect,
  isOpen,
}: MentionAutocompleteProps) {
  const [mentionQuery, setMentionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastAmpersand = content.lastIndexOf("&");
    if (lastAmpersand === -1) {
      setMentionQuery("");
      setShowSuggestions(false);
      return;
    }

    const afterAmpersand = content.substring(lastAmpersand + 1);
    if (afterAmpersand.includes(" ")) {
      setShowSuggestions(false);
      return;
    }

    setMentionQuery(afterAmpersand);
    if (afterAmpersand.length > 0) {
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [content]);

  const searchResults = useQuery(
    api.search.globalSearch,
    showSuggestions && mentionQuery.length > 0
      ? {
          query: mentionQuery,
          type: "all",
        }
      : "skip"
  );

  const users = searchResults?.users || [];
  const posts = searchResults?.posts || [];
  const listings = searchResults?.listings || [];

  const allSuggestions = [
    ...users.map((u) => ({ type: "user" as const, id: u._id, name: u.name, email: u.email })),
    ...posts.map((p) => ({ type: "post" as const, id: p._id, name: p.content.substring(0, 50), content: p.content })),
    ...listings.map((l) => ({ type: "listing" as const, id: l._id, name: l.serviceDetails?.title || l.content.substring(0, 50), content: l.content })),
  ];

  const handleSelectMention = (suggestion: any) => {
    const lastAmpersand = content.lastIndexOf("&");
    const beforeMention = content.substring(0, lastAmpersand);
    const afterMention = content.substring(lastAmpersand + mentionQuery.length + 1);
    
    const newContent = `${beforeMention}&${suggestion.name}${afterMention}`;
    onMentionSelect(newContent);
    setShowSuggestions(false);
    setMentionQuery("");
  };

  if (!showSuggestions || allSuggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={suggestionsRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
      >
        {allSuggestions.map((suggestion, index) => (
          <motion.button
            key={`${suggestion.type}-${suggestion.id}`}
            onClick={() => handleSelectMention(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
              index === selectedIndex
                ? "bg-purple-100 text-slate-900"
                : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            {suggestion.type === "user" ? (
              <User className="h-4 w-4 text-purple-600 flex-shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{suggestion.name}</p>
              {suggestion.type === "user" && "email" in suggestion && (
                <p className="text-xs text-slate-500 truncate">{suggestion.email}</p>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">
              {suggestion.type === "user" ? "User" : suggestion.type === "listing" ? "Listing" : "Post"}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}