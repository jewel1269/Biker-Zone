import { useState } from "react";
import CreateNews from "./CreateNews.jsx";

export default function App() {
  const [notice, setNotice] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-corporate-100/80 to-corporate-50">
      {notice && (
        <div
          className="fixed top-4 right-4 z-50 rounded-lg border border-corporate-200 bg-white px-4 py-3 text-sm font-medium text-corporate-800 shadow-corporate-lg"
          role="status"
        >
          {notice}
        </div>
      )}
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <CreateNews
          onCreated={() => {
            setNotice("Press release submitted successfully.");
            setTimeout(() => setNotice(null), 4000);
          }}
        />
      </div>
    </div>
  );
}
