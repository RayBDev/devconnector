import * as actionTypes from "../actions/types";

const initialState = {
  emailSent: false,
  passwordReset: false
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
    default:
      return state;
  }
}
