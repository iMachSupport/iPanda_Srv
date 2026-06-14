import { create } from "zustand";
import type { Conversation, Message } from "../sdk/ipanda.types";

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface ConversationStore {
  conversations: Record<string, Conversation>;
  activeConversationId: string;

  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void;
  getActiveConversation: () => Conversation | null;
  clearConversation: (conversationId: string) => void;
}

const initialConversationId = generateId();

const initialConversation: Conversation = {
  id: initialConversationId,
  messages: [],
  createdAt: new Date(),
};

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: { [initialConversationId]: initialConversation },
  activeConversationId: initialConversationId,

  createConversation: () => {
    const id = generateId();
    set((state) => ({
      conversations: {
        ...state.conversations,
        [id]: { id, messages: [], createdAt: new Date() },
      },
      activeConversationId: id,
    }));
    return id;
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return state;
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: [...conversation.messages, message],
          },
        },
      };
    });
  },

  updateMessage: (conversationId, messageId, patch) => {
    set((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return state;
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conversation,
            messages: conversation.messages.map((m) =>
              m.id === messageId ? { ...m, ...patch } : m
            ),
          },
        },
      };
    });
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations[activeConversationId] ?? null;
  },

  clearConversation: (conversationId) => {
    set((state) => {
      const conversation = state.conversations[conversationId];
      if (!conversation) return state;
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: { ...conversation, messages: [] },
        },
      };
    });
  },
}));
