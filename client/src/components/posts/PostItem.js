import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Link } from "react-router-dom";

import * as actionCreators from "../../store/actions";

class PostItem extends Component {
  state = {
    liked: false
  };

  componentDidMount() {
    this.isPostLiked(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.isPostLiked(nextProps);
  }

  onDeleteClick = id => {
    this.props.deletePost(id);
  };

  onLikeClick = id => {
    this.props.addLike(id);
  };

  onRemoveLikeClick = id => {
    this.props.removeLike(id);
  };

  isPostLiked(props) {
    const { auth, post } = props;

    if (post.likes.filter(like => like.user === auth.user._id).length > 0) {
      this.setState({ liked: true });
    } else {
      this.setState({ liked: false });
    }
  }

  render() {
    const { post, auth, showActions } = this.props;

    return (
      <div className="card card-body mb-3">
        <div className="row">
          <div className="col-md-2">
            <a href="profile.html">
              <img
                className="rounded-circle d-none d-md-block"
                src={post.avatar}
                alt={post.name}
              />
            </a>
            <br />
            <p className="text-center">{post.name}</p>
          </div>
          <div className="col-md-10" key={Math.random()}>
            <p className="lead">{post.text}</p>
            {showActions ? (
              <span>
                <button
                  onClick={() => this.onLikeClick(post._id)}
                  type="button"
                  className="btn btn-light mr-1"
                >
                  <i
                    className={classnames({
                      "fas fa-thumbs-up": true,
                      "text-success": this.state.liked,
                      "text-secondary": !this.state.liked
                    })}
                  />
                  <span className="badge badge-light">{post.likes.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => this.onRemoveLikeClick(post._id)}
                  className="btn btn-light mr-1"
                >
                  <i className="text-secondary fas fa-thumbs-down" />
                </button>
                <Link to={`/post/${post._id}`} className="btn btn-info mr-1">
                  Comments
                </Link>
                {post.user === auth.user._id ? (
                  <button
                    onClick={() => this.onDeleteClick(post._id)}
                    type="button"
                    className="btn btn-danger mr-1"
                  >
                    <i className="fas fa-times" />
                  </button>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

PostItem.defaultProps = {
  showActions: true
};

PostItem.propTypes = {
  deletePost: PropTypes.func.isRequired,
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  deletePost: id => dispatch(actionCreators.deletePost(id)),
  addLike: id => dispatch(actionCreators.addLike(id)),
  removeLike: id => dispatch(actionCreators.removeLike(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostItem);
