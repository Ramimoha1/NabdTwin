import { createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeContext } from '../../services/API/advisoryApi';
import { addMessage, askAIPending, askAIFulfilled, askAIRejected } from './advisorySlice';
import type { RootState } from '../store';

/**
 * Async thunk to send a question to the AI Advisory backend.
 * - Adds the user message to Redux before making the API call.
 * - Dispatches lifecycle actions to update loading state and add AI response.
 */
export const askAdvisoryAI = createAsyncThunk<
  void, // Return type (we handle state via dispatch, not return)
  string | undefined, // Argument type (user question)
  { state: RootState }
>(
  'advisory/askAI',
  async (question, { getState, dispatch }) => {
    // Set loading state
    dispatch(askAIPending());
    
    try {
      // Get the current context from Redux state
      const { advisory } = getState();
      const context = advisory.currentContext || { entityName: "System", scope: "General", data: {} };

      // Add user message to chat history (only if a question was provided)
      if (question) {
        dispatch(addMessage({
          role: 'user',
          content: question,
          timestamp: new Date().toISOString()
        }));
      }

      // Call the backend API
      const response = await analyzeContext(context, question);

      // Add AI response to chat history
      dispatch(askAIFulfilled(response));
    } catch (error) {
      // Add error message to chat history
      dispatch(askAIRejected("⚠️ I am having trouble connecting to the server. Please check your internet or try again."));
    }
  }
);
