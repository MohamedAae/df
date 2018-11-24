import React, { Component } from "react";
import "whatwg-fetch";
import "grapesjs/dist/css/grapes.min.css";
import grapesjs from "grapesjs";
import "grapesjs-preset-webpage";

import { getFromStorage, setInStorage } from "../../utils/storage";

class Home extends Component {
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
        <div>
          <p>Loading ..</p>
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

    const editor = grapesjs.init({
      storageManager: {
        id: "gjs-", // Prefix identifier that will be used on parameters
        type: "local", // Type of the storage
        autosave: true, // Store data automatically
        autoload: true, // Autoload stored data on init
        stepsBeforeSave: 1 // If autosave enabled, indicates how many changes are necessary before store method is triggered
      },
      // Indicate where to init the editor. You can also pass an HTMLElement
      container: "#gjs",
      // Get the content for the canvas directly from the element
      // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
      plugins: ["gjs-preset-webpage"],
      pluginsOpts: {
        "gjs-preset-webpage": {
          // options
        }
      },
      assetManager: {
        // Upload endpoint, set `false` to disable upload, default `false`
        upload: "/api/uploadimage",

        // The name used in POST to pass uploaded files, default: `'files'`
        uploadName: "files",
        noAssets: "You haven't uploaded anything yet",
        uploadText: "Drop your file here or click to upload",
        multiUpload: true,
        addBtnText: "Import",
        dropzoneContent:
          '<div class="dropzone-inner">Drop here your assets</div>',
        openAssetsOnDrop: 1,
        modalTitle: "Add Image",
        autoAdd: 1,
        credentials: "include"
      }
    });

    return <></>;
  }
}

export default Home;
