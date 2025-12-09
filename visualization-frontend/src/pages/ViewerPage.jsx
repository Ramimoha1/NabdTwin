/* OLD BLUEPRINT3D TEST CODE. YOU CAN REMOVE THE FILE

// src/pages/ViewerPage.jsx
import { useEffect } from "react";

export default function ViewerPage() {
  useEffect(() => {
    // Load example.js to initialize Blueprint3D controls
    const script = document.createElement("script");
    script.src = "/blueprint3d/js/example.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="blueprint-container">
      <iframe
        src="/blueprint3d/example/index.html"
        style={{ width: "100vw", height: "100vh", border: "none" }}
      />
    </div>
  );
}
*/