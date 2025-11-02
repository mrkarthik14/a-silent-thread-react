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
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute bottom-full mb-2 left-0 right-0 bg-gradient-to-br from-white via-slate-50 to-purple-50 border-2 border-purple-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto backdrop-blur-sm"
      >
        {allSuggestions.map((suggestion, index) => (
          <motion.button
            key={`${suggestion.type}-${suggestion.id}`}
            onClick={() => handleSelectMention(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, ease: "easeOut" }}
            whileHover={{ x: 4, backgroundColor: "rgba(168, 85, 247, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 border-l-4 ${
              index === selectedIndex
                ? "bg-gradient-to-r from-purple-100 to-purple-50 border-l-purple-500 text-slate-900 shadow-sm"
                : "border-l-transparent hover:border-l-purple-300 text-slate-700"
            }`}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {suggestion.type === "user" ? (
                <User className="h-5 w-5 text-purple-600 flex-shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">{suggestion.name}</p>
              {suggestion.type === "user" && "email" in suggestion && (
                <p className="text-xs text-slate-500 truncate">{suggestion.email}</p>
              )}
            </div>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`text-xs font-bold flex-shrink-0 px-2 py-1 rounded-full ${
                suggestion.type === "user"
                  ? "bg-purple-200 text-purple-700"
                  : suggestion.type === "listing"
                  ? "bg-blue-200 text-blue-700"
                  : "bg-pink-200 text-pink-700"
              }`}
            >
              {suggestion.type === "user" ? "👤" : suggestion.type === "listing" ? "📦" : "📝"}
            </motion.span>
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}