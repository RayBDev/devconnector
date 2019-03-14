import axios from "axios";
import jwt_decode from "jwt-decode";

import setAuthToken from "../../utils/setAuthToken";
import * as actionTypes from "./types";

// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login"))
    .catch(err =>
      dispatch({
        type: actionTypes.GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: actionTypes.SET_CURRENT_USER,
    payload: decoded
  };
};

// Login - Get User Token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      // Save to localStorage
      const { token } = res.data;
      // Set token to localStorage
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: actionTypes.GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from localStorage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};

// Get user email for password reset
export const resetEmail = userEmail => dispatch => {
  axios
    .post("/api/users/forgetpw", userEmail)
    .then(res =>
      dispatch({
        type: actionTypes.PASSWORD_RESET_EMAIL_SENT
      })
    )
    .catch(err =>
      dispatch({
        type: actionTypes.GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Check Password Reset Token Validity
export const checkTokenValidity = () => dispatch => {
  axios
    .patch("/api/users/resetpw", {})
    .then(res => null)
    .catch(err =>
      dispatch({
        type: actionTypes.TOKEN_ERROR,
        payload: err.response.data
      })
    );
};

// Set new password
export const setNewPassword = newPassword => dispatch => {
  axios
    .patch("/api/users/resetpw", newPassword)
    .then(res =>
      dispatch({
        type: actionTypes.RESET_PASSWORD
      })
    )
    .catch(err =>
      dispatch({
        type: actionTypes.GET_ERRORS,
        payload: err.response.data
      })
    );
};
