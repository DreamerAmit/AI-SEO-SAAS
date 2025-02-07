import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./AuthContext/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Add this to verify the URL and client ID
const currentURL = window.location.origin;
console.log("Application running at:", currentURL);
console.log("Using Google Client ID:", clientId);

//React query client
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoogleOAuthProvider 
          clientId={clientId}
          onScriptLoadSuccess={() => {
            console.log("Google OAuth script loaded successfully");
            // Initialize Google OAuth globally
            if (window.google?.accounts?.id) {
              window.google.accounts.id.initialize({
                client_id: clientId,
                auto_select: false,
                callback: () => {},
              });
            }
          }}
          onScriptLoadError={(error) => console.error("Google OAuth script failed to load:", error)}
        >
          <App />
        </GoogleOAuthProvider>
      </AuthProvider>
      {/*  <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
