import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import * as actionCreators from "../../store/actions";
import Aux from "../hoc/Aux/Aux";
import TextFieldGroup from "../common/TextFieldGroup";

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
            Enter your registered email address to reset your password
          </p>
          <form noValidate onSubmit={this.onSubmit}>
            <TextFieldGroup
              placeholder="Registered Email Address"
              name="email"
              type="email"
              value={this.state.email}
              onChange={this.onChange}
              error={errors.email}
            />

            <input type="submit" className="btn btn-info btn-block mt-4" />
          </form>
        </Aux>
      );
    } else {
      form = (
        <p className="lead text-center text-success">
          Please check your email for your account reset link. You will only
          receive an email if the account exists.
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
