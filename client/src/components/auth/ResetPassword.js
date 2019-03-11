import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import classnames from "classnames";
import { connect } from "react-redux";

import * as actionCreators from "../../store/actions";
import Aux from "../hoc/Aux/Aux";
import setAuthToken from "../../utils/setAuthToken";

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
    if (!this.props.pwReset.passwordReset) {
      form = (
        <Aux>
          <p className="lead text-center">Enter your new password</p>
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <input
                type="password"
                className={classnames("form-control form-control-lg", {
                  "is-invalid": errors.password
                })}
                placeholder="Password"
                name="password"
                value={this.state.password}
                onChange={this.onChange}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
            <div className="form-group">
              <input
                type="password"
                className={classnames("form-control form-control-lg", {
                  "is-invalid": errors.password2
                })}
                placeholder="Confirm Password"
                name="password2"
                value={this.state.password2}
                onChange={this.onChange}
              />
              {errors.password2 && (
                <div className="invalid-feedback">{errors.password2}</div>
              )}
            </div>
            <input type="submit" className="btn btn-info btn-block mt-4" />
          </form>
        </Aux>
      );
    } else {
      form = (
        <Aux>
          <p className="lead text-center">
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
    dispatch(actionCreators.setNewPassword(newPassword))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ResetPassword));
