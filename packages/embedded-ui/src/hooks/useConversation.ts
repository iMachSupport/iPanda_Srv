import { useConversationStore } from "../store/conversation.store";

export const useConversation = () => {
  const {
    activeConversationId,
    conversations,
    createConversation,
    setActiveConversation,
    clearConversation,
    getActiveConversation,
  } = useConversationStore();

  return {
    activeConversationId,
    conversations,
    activeConversation: getActiveConversation(),
    createConversation,
    setActiveConversation,
    clearConversation,
  };
};
