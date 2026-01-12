import { api } from './api';

export const analyzeContext = async (_contextData: any, userQuestion?: string) => {
  try {
    const response = await api.post('/api/advisory/analyze', {
      userQuestion: userQuestion || "Analyze the overall organizational health based on the latest data."
    }, {
      timeout: 60000 
    });

    return response.data.response; 
  } catch (error) {
    console.error('Error fetching AI analysis:', error);
    throw error;
  }
};

export default {
  analyzeContext,
};