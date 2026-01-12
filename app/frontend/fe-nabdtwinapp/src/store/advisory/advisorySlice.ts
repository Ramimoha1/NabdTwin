import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Message interface for chat history
export interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: string; // ISO string for serializability
}

interface AdvisoryState {
  isOpen: boolean;
  currentContext: any | null;
  messages: Message[];
  isLoading: boolean;
}

const initialState: AdvisoryState = {
  isOpen: false,
  currentContext: null,
  messages: [],
  isLoading: false,
};

const advisorySlice = createSlice({
  name: 'advisory',
  initialState,
  reducers: {
    setAdvisoryOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setAdvisoryContext: (state, action: PayloadAction<any>) => {
      state.currentContext = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
    },
    // Actions for thunk lifecycle (to avoid circular imports)
    askAIPending: (state) => {
      state.isLoading = true;
    },
    askAIFulfilled: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.messages.push({
        role: 'ai',
        content: action.payload,
        timestamp: new Date().toISOString()
      });
    },
    askAIRejected: (state, action: PayloadAction<string | undefined>) => {
      state.isLoading = false;
      state.messages.push({
        role: 'ai',
        content: action.payload || "⚠️ I am having trouble connecting to the server. Please check your internet or try again.",
        timestamp: new Date().toISOString()
      });
    }
  }
});

export const { 
  setAdvisoryOpen, 
  setAdvisoryContext, 
  addMessage, 
  setLoading, 
  clearChat,
  askAIPending,
  askAIFulfilled,
  askAIRejected
} = advisorySlice.actions;

export default advisorySlice.reducer;