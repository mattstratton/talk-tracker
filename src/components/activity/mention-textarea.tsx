"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { UserAvatar } from "~/components/user-avatar";
import { api } from "~/trpc/react";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: users } = api.activity.getAllUsers.useQuery();

  // Filter users based on mention query
  const filteredUsers =
    users?.filter(
      (user) =>
        user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(mentionQuery.toLowerCase()),
    ) ?? [];

  // Find if we're in a mention context
  const checkForMention = (text: string, position: number) => {
    // Look backwards from cursor to find @
    let mentionStart = -1;
    for (let i = position - 1; i >= 0; i--) {
      if (text[i] === "@") {
        mentionStart = i;
        break;
      }
      // Stop if we hit a space or newline before finding @
      if (text[i] === " " || text[i] === "\n") {
        break;
      }
    }

    if (mentionStart !== -1) {
      // Extract the query after @
      const query = text.slice(mentionStart + 1, position);
      // Only show suggestions if query doesn't contain spaces
      if (!query.includes(" ") && !query.includes("\n")) {
        setMentionQuery(query);
        setShowSuggestions(true);
        setSelectedIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart ?? 0;
    onChange(newValue);
    setCursorPosition(newPosition);
    checkForMention(newValue, newPosition);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (showSuggestions) {
        e.preventDefault();
        insertMention(filteredUsers[selectedIndex]!);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user: User) => {
    if (!textareaRef.current) return;

    // Find the @ position
    let mentionStart = -1;
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (value[i] === "@") {
        mentionStart = i;
        break;
      }
    }

    if (mentionStart === -1) return;

    // Replace from @ to cursor with the username
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursorPosition);
    const newValue = `${before}@${user.username} ${after}`;

    onChange(newValue);
    setShowSuggestions(false);

    // Set cursor position after the inserted username
    setTimeout(() => {
      const newPosition = mentionStart + user.username.length + 2; // +2 for @ and space
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
      textareaRef.current?.focus();
    }, 0);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      selectedElement?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="resize-none"
      />

      {showSuggestions && filteredUsers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 text-blue-900"
                  : "hover:bg-gray-50"
              }`}
            >
              <UserAvatar name={user.name} image={user.image} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  @{user.username}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
