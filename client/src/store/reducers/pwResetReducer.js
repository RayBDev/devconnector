import * as actionTypes from "../actions/types";

const initialState = {
  emailSent: false,
  passwordReset: false,
  tokenIsValid: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PASSWORD_RESET_EMAIL_SENT:
      return {
        ...state,
        emailSent: true
      };
    case actionTypes.RESET_PASSWORD:
      return {
        ...state,
        passwordReset: true
      };
    case actionTypes.TOKEN_ERROR:
      let tokenIsValid;
      if (action.payload === "Unauthorized") {
        tokenIsValid = false;
      } else {
        tokenIsValid = true;
      }
      return {
        ...state,
        tokenIsValid
      };
    default:
      return state;
  }
}
