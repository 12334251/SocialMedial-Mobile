// registrationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the picture file
export interface PictureFile {
  uri: string;
  name: string;
  type: string;
}

// Define the state interface
interface RegistrationState {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  occupation: string;
  picture: PictureFile | null;
  password: string;
}

const initialState: RegistrationState = {
  firstName: "",
  lastName: "",
  email: "",
  location: "",
  occupation: "",
  picture: null,
  password: "",
};

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    setName: (
      state,
      action: PayloadAction<{ firstName: string; lastName: string }>
    ) => {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setLocationOccupation: (
      state,
      action: PayloadAction<{ location: string; occupation: string }>
    ) => {
      state.location = action.payload.location;
      state.occupation = action.payload.occupation;
    },
    setPicture: (state, action: PayloadAction<PictureFile>) => {
      state.picture = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    clearRegistration: (state) => {
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.location = "";
      state.occupation = "";
      state.picture = null;
      state.password = "";
    },
  },
});

export const {
  setName,
  setEmail,
  setLocationOccupation,
  setPicture,
  setPassword,
  clearRegistration,
} = registrationSlice.actions;

export default registrationSlice.reducer;
