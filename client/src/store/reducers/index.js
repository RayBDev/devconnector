import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import pwResetReducer from "./pwResetReducer";
import profileReducer from "./profileReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  pwReset: pwResetReducer,
  profile: profileReducer
});
