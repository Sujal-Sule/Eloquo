import { create } from 'zustand';

export const useSessionStore = create((set) => ({
  currentSession: null,
  messages: [],
  passCount: 0,
  maxPasses: 3,
  isRecording: false,
  isMandatory: false,
  timeRemaining: 0,
  sessionStatus: 'idle',

  setSession: (session) => set({
    currentSession: session,
    messages: session.messages || [],
    passCount: session.passCount || 0,
    maxPasses: session.maxPasses || 3,
    sessionStatus: 'active'
  }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),

  addMessages: (msgs) => set((state) => ({
    messages: [...state.messages, ...msgs]
  })),

  incrementPass: () => set((state) => {
    const newCount = state.passCount + 1;
    return {
      passCount: newCount,
      isMandatory: newCount >= state.maxPasses
    };
  }),

  setRecording: (val) => set({ isRecording: val }),
  setMandatory: (val) => set({ isMandatory: val }),
  setTimeRemaining: (val) => set({ timeRemaining: val }),
  setSessionStatus: (status) => set({ sessionStatus: status }),
  resetSession: () => set({
    currentSession: null, messages: [], passCount: 0, maxPasses: 3,
    isRecording: false, isMandatory: false, timeRemaining: 0, sessionStatus: 'idle'
  })
}));
