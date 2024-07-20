import React, { useEffect } from "react";

const RedirectComponent = ({ redirectUrl }) => {
  useEffect(() => {
    window.location.href = redirectUrl;
  }, [redirectUrl]);

  return (
    <div>
      <h2>Redirecting...</h2>
      <p>
        If you are not redirected,{" "}
        <a href={redirectUrl} className="text-blue-500 hover:underline">
          click here
        </a>
        .
      </p>
    </div>
  );
};

export default RedirectComponent;
