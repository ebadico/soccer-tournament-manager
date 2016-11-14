import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import {
  validPassword,
  validPasswordCheck,
  signinPasswordError,
  signinPasswordCheckError,
  checkUserExist,
  checkEmailExist,
  startSignin,
} from 'actions'

require('style!css!sass!../styles/views/register.scss')

class Register extends React.Component {

  componentDidMount() {
    const $app = document.getElementById('app')
    const $loaderWrapper = document.getElementById('loader-wrapper')
    const $body = document.body
    $body.className = $body.className.replace('app-loading', '')
    $loaderWrapper.className = 'hide'
    $app.className = $app.className.replace('hide', '')
  }

  componentDidUpdate() {
    const { signin } = this.props

    if (signin.usernameExist) {
      findDOMNode(this.usernameInput).className = 'invalid'
    } else {
      findDOMNode(this.usernameInput).className = 'valid'
    }
  }

  onRegister(e) {
    e.preventDefault()
    e.stopPropagation()
    const { dispatch, signin } = this.props
    const username = this.usernameInput.value
    const email = this.emailInput.value
    const password = this.passwordInput.value
    console.log(!signin.usernameExist, !signin.emailExist, signin.validPassword, signin.validPasswordCheck)
    if (!signin.usernameExist && !signin.emailExist && signin.validPassword && signin.validPasswordCheck) {
      dispatch(startSignin(username, password, email)).then((res) => {
        if (res.status === 200) {
          browserHistory.push('/admin')
        }
      })
    }
  }

  checkUserExist() {
    const { dispatch } = this.props
    const username = this.usernameInput.value
    if (username.length) dispatch(checkUserExist(username))
  }

  checkEmailExist() {
    const { dispatch } = this.props
    const email = this.emailInput.value
    if (email.length) dispatch(checkEmailExist(email))
  }

  validatePassword() {
    const { dispatch } = this.props
    const password = this.passwordInput.value
    if (password.length >= 6) {
      dispatch(validPassword(true))
      dispatch(signinPasswordError(null))
      findDOMNode(this.passwordInput).className = 'valid'
    } else {
      dispatch(validPassword(false))
      dispatch(signinPasswordError('Password must be longer than 6 characters'))
      findDOMNode(this.passwordInput).className = 'invalid'
    }
  }

  validateRetypedPassword() {
    const { dispatch } = this.props
    const password = this.passwordInput.value
    const check = this.checkPasswordInput.value

    if (password === check) {
      dispatch(validPasswordCheck(true))
      dispatch(signinPasswordCheckError(null))
      findDOMNode(this.checkPasswordInput).className = 'valid'
    } else {
      findDOMNode(this.checkPasswordInput).className = 'invalid'
      dispatch(signinPasswordCheckError('Password mismatch'))
      dispatch(validPasswordCheck(false))
    }
  }

  formUsernameErrorHandler() {
    let label
    const { usernameError } = this.props.signin
    if (usernameError && usernameError.length) {
      label = (
        <label htmlFor="username-input" className="signin-form-error">{ usernameError }</label>
      )
    }
    return label
  }

  formEmailErrorHandler() {
    let label
    const { emailError } = this.props.signin
    if (emailError && emailError.length) {
      label = (
        <label htmlFor="email-input" className="signin-form-error">{ emailError }</label>
      )
    }
    return label
  }

  formPasswordErrorHandler() {
    let label
    const { passwordError } = this.props.signin
    if (passwordError && passwordError.length) {
      label = (
        <label htmlFor="password-input" className="signin-form-error">{ passwordError }</label>
      )
    }
    return label
  }

  formPasswordCheckErrorHandler() {
    let label
    const { passwordCheckError } = this.props.signin
    if (passwordCheckError && passwordCheckError.length) {
      label = (
        <label htmlFor="password-input" className="signin-form-error">{ passwordCheckError }</label>
      )
    }
    return label
  }

  render() {
    return (
      <div id="signin-form">
        <h1 className="title">Join!</h1>
        <form>
          {this.formUsernameErrorHandler()}
          <input
            ref={(c) => { this.usernameInput = c }}
            id="username-input"
            type="text"
            placeholder="username"
            onChange={() => this.checkUserExist()}
          />
          {this.formEmailErrorHandler()}
          <input
            ref={(c) => { this.emailInput = c }}
            id="email-input"
            type="email"
            placeholder="email"
            onChange={() => this.checkEmailExist()}
          />
          {this.formPasswordErrorHandler()}
          <input
            ref={(c) => { this.passwordInput = c }}
            id="password-input"
            type="password"
            placeholder="password"
            onChange={() => this.validatePassword()}
          />
          {this.formPasswordCheckErrorHandler()}
          <input
            ref={(c) => { this.checkPasswordInput = c }}
            type="password"
            id="retype-password-input"
            placeholder="retype password"
            onChange={() => this.validateRetypedPassword()}
          />
          <div>
            <input className="register-button" type="button" value="Join" onClick={(e) => this.onRegister(e)} />
          </div>
        </form>
      </div>
    )
  }
}

Register.propTypes = {
  signin: React.PropTypes.object,
  dispatch: React.PropTypes.func,
}

export default connect((state) => ({
  signin: state.signin,
}))(Register)
