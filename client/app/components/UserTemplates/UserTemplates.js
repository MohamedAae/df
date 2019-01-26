import React, { Component } from "react";
import ReactDOM from "react-dom";
import { FileManager, FileNavigator } from "@opuscapita/react-filemanager";
import connectorNodeV1 from "@opuscapita/react-filemanager-connector-node-v1";
import { getFromStorage, setInStorage } from "../../utils/storage";
import Header from "../Header/Header";
import { Document, Page } from "react-pdf";

class userTemplates extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      token: "",
      signUpError: "",
      signInError: "",
      signInEmail: "",
      signInPassword: "",
      numPages: null,
      pageNumber: 1
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
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

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
    const { pageNumber, numPages } = this.state;
    var filePreview = "/api/view";
    $(document).ready(function() {
      document.addEventListener("click", function() {
        if ($(".oc-fm--list-view__row--selected")[0]) {
          var pdfNumber = document.querySelector(
            ".oc-fm--list-view__row--selected .oc-fm--name-cell__title"
          ).innerHTML;
          fetch("/api/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pdfNumber: pdfNumber
            })
          });
          ReactDOM.unmountComponentAtNode(
            document.getElementById("livepreview")
          );
          ReactDOM.render(
            <div
              id="pdfviewer"
              style={{
                height: "92vh",
                width: "50%",
                float: "right",
                minWidth: "320px",
                flex: "1",
                padding: "12px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end"
              }}
            >
              <div
                id="pdfcontainer"
                style={{
                  height: "100%",
                  overflow: "auto"
                }}
              >
                <Document
                  file={filePreview}
                  onLoadSuccess={this.onDocumentLoadSuccess}
                >
                  <Page pageNumber={pageNumber} />
                </Document>
              </div>{" "}
              <input
                type="submit"
                id="test"
                name="commit"
                value="Live PDF Viewer"
                className="btn btn-primary btn-block"
              />
            </div>,
            document.getElementById("livepreview")
          );
        }
      });
    });
    const fileManager = (
      <div>
        <Header />
        <div
          style={{
            height: "92vh",
            width: "50%",
            float: "left",
            minWidth: "320px",
            flex: "1",
            padding: "12px",
            backgroundColor: "#f5f5f5"
          }}
        >
          <FileManager>
            {/* Use NodeJS API v1 connector */}
            <FileNavigator
              id="cusomization-area"
              api={connectorNodeV1.api}
              apiOptions={{
                ...connectorNodeV1.apiOptions,
                apiRoot: `http://localhost:8080`,
                locale: "en" // 'en' / 'de'
              }}
              capabilities={connectorNodeV1.capabilities}
              initialResourceId={connectorNodeV1.nodejsInitId}
              listViewLayout={connectorNodeV1.listViewLayout}
              viewLayoutOptions={{
                ...connectorNodeV1.viewLayoutOptions,
                locale: "en" // 'en' / 'de'
              }}
              signInRenderer={() => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end"
                  }}
                />
              )}
            />
          </FileManager>
        </div>
        <div id="livepreview">
          <div
            id="pdfviewer"
            style={{
              height: "92vh",
              width: "50%",
              float: "right",
              minWidth: "320px",
              flex: "1",
              padding: "12px",
              backgroundColor: "#f5f5f5",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end"
            }}
          >
            <div
              id="pdfcontainer"
              style={{
                height: "100%",
                overflow: "auto"
              }}
            >
              <Document
                file={filePreview}
                onLoadSuccess={this.onDocumentLoadSuccess}
              >
                <Page pageNumber={pageNumber} />
              </Document>
            </div>{" "}
            <input
              type="submit"
              id="test"
              name="commit"
              value="Live PDF Viewer"
              className="btn btn-primary btn-block"
            />
          </div>
        </div>
      </div>
    );

    ReactDOM.render(fileManager, document.body);
  }
}

export default userTemplates;
