import React, { Component } from "react";
import "whatwg-fetch";
import "grapesjs-preset-webpage";
import { getFromStorage, setInStorage } from "../../utils/storage";
import Cookies from "universal-cookie";

class NotFound extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      token: "",
      signUpError: "",
      signInError: "",
      signInEmail: "",
      signInPassword: ""
    };

    this.signInEmailChange = this.signInEmailChange.bind(this);
    this.signInPasswordChange = this.signInPasswordChange.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
  }

  componentDidMount() {
    const obj = getFromStorage("df_access");
    if (obj && obj.token) {
      const { token } = obj;
      // Verify Token
      fetch("/api/account/verify?token=" + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token,
              isLoading: false
            });
          } else {
            this.setState({
              isLoading: false
            });
          }
        });
    } else {
      this.setState({
        isLoading: false
      });
    }
  }

  signInEmailChange(event) {
    this.setState({
      signInEmail: event.target.value
    });
  }

  signInPasswordChange(event) {
    this.setState({
      signInPassword: event.target.value
    });
  }

  onSignIn(event) {
    // Grab the state
    const { signInEmail, signInPassword } = this.state;
    this.setState({
      isLoading: true
    });
    fetch("/api/account/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: signInEmail,
        password: signInPassword
      })
    })
      .then(res => res.json())
      .then(json => {
        console.log("json", json);
        if (json.success) {
          setInStorage("df_access", { token: json.token });
          const cookies = new Cookies();
          cookies.set("df_access", json.token, { path: "/" });
          this.setState({
            signInError: json.message,
            isLoading: false,
            signInEmail: "",
            signInPassword: "",
            token: json.token
          });
        } else {
          this.setState({
            signInError: json.message,
            isLoading: false
          });
        }
      });
    // Submit state to backend to verify
  }

  render() {
    const {
      isLoading,
      token,
      signInEmail,
      signInPassword,
      signInError
    } = this.state;

    if (isLoading) {
      return (
        <div id="loading">
          <div className="c">
            <div className="loading-text">Loading</div>
            <hr />
            <div className="_1">Kindly, be patient.</div>
          </div>
        </div>
      );
    }

    if (!token) {
      return (
        <div id="access">
          <div className="login">
            <header className="header">
              <h1>Sign in to DocFactory</h1>
            </header>
            <div className="sign-in">
              {signInError ? <p>{signInError}</p> : null}
              <div className="signin-modal">
                <label>Email Address</label>
                <input
                  type="email"
                  name="login"
                  id="login_field"
                  className="form-control input-block"
                  value={signInEmail}
                  onChange={this.signInEmailChange}
                />
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control form-control input-block"
                  value={signInPassword}
                  onChange={this.signInPasswordChange}
                />
                <input
                  type="submit"
                  name="commit"
                  value="Sign in"
                  className="btn btn-primary btn-block"
                  data-disable-with="Signing in…"
                  onClick={this.onSignIn}
                />
              </div>
            </div>
            <div className="create-account">
              <p>
                Need Access? <a href="#">Sign Up</a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div id="notfound">
        <div className="c">
          <div className="_404">404</div>
          <hr />
          <div className="_1">THE PAGE</div>
          <div className="_2">WAS NOT FOUND</div>
          <a className="notfound-btn" href="/">
            BACK TO BUILD
          </a>
        </div>
      </div>
    );
  }
}

export default NotFound;
