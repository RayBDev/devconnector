import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { connect } from "react-redux";

import * as actionCreators from "../../store/actions";
import Aux from "../hoc/Aux/Aux";

class ForgetPassword extends Component {
  state = {
    email: "",
    errors: {}
  };

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
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
    const userEmail = { email: this.state.email };
    this.props.resetEmail(userEmail);
  };

  render() {
    const { errors } = this.state;

    let form;
    if (!this.props.pwReset.emailSent) {
      form = (
        <Aux>
          <p className="lead text-center">
            Enter your email address to reset your password
          </p>
          <form noValidate onSubmit={this.onSubmit}>
            <div className="form-group">
              <input
                type="email"
                className={classnames("form-control form-control-lg", {
                  "is-invalid": errors.email
                })}
                placeholder="Email Address"
                name="email"
                value={this.state.email}
                onChange={this.onChange}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
            <input type="submit" className="btn btn-info btn-block mt-4" />
          </form>
        </Aux>
      );
    } else {
      form = (
        <p className="lead text-center text-success">
          You will receive an email shortly if the account exists.
        </p>
      );
    }

    return (
      <div className="forgetpw">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Forget Password?</h1>
              {form}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ForgetPassword.propTypes = {
  resetEmail: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  pwReset: state.pwReset
});

const mapDispatchToProps = dispatch => ({
  resetEmail: userEmail => dispatch(actionCreators.resetEmail(userEmail))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgetPassword);
