import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import * as actionCreators from "../../store/actions";
import Aux from "../hoc/Aux/Aux";
import setAuthToken from "../../utils/setAuthToken";
import TextFieldGroup from "../common/TextFieldGroup";

class ResetPassword extends Component {
  state = {
    password: "",
    password2: "",
    token: "",
    errors: {}
  };

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }

    setAuthToken(this.state.token);
    this.props.checkTokenValidity();
  }

  componentWillMount() {
    const query = new URLSearchParams(this.props.location.search);
    let token = "";
    for (let param of query.entries()) {
      token = param[1];
    }

    this.setState({ token });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const newPassword = {
      password: this.state.password,
      password2: this.state.password2
    };

    this.props.setNewPassword(newPassword);
  };

  render() {
    const { errors } = this.state;

    let form;
    if (!this.props.pwReset.tokenIsValid) {
      form = (
        <Aux>
          <p className="lead text-center text-danger">
            Your password reset link has expired. Please reset your password
            again.
          </p>
        </Aux>
      );
    } else if (!this.props.pwReset.passwordReset) {
      form = (
        <Aux>
          <p className="lead text-center">Enter your new password</p>
          <form onSubmit={this.onSubmit}>
            <TextFieldGroup
              placeholder="New Password"
              name="password"
              type="password"
              value={this.state.password}
              onChange={this.onChange}
              error={errors.password}
            />

            <TextFieldGroup
              placeholder="Confirm New Password"
              name="password2"
              type="password"
              value={this.state.password2}
              onChange={this.onChange}
              error={errors.password}
            />

            <input type="submit" className="btn btn-info btn-block mt-4" />
          </form>
        </Aux>
      );
    } else {
      form = (
        <Aux>
          <p className="lead text-center text-success">
            Your password has been reset successfully.
          </p>
        </Aux>
      );
    }

    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Reset Password</h1>
              {form}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ResetPassword.propTypes = {
  setNewPassword: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  pwReset: state.pwReset
});

const mapDispatchToProps = dispatch => ({
  setNewPassword: newPassword =>
    dispatch(actionCreators.setNewPassword(newPassword)),
  checkTokenValidity: () => dispatch(actionCreators.checkTokenValidity())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ResetPassword));
