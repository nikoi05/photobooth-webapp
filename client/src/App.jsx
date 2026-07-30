import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page";
import ChooseInputPage from "./pages/choose-option-page";
import UploadPage from "./pages/upload-page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/start" element={<ChooseInputPage />} />
      <Route path="/upload" element={<UploadPage />} />
    </Routes>
  );
}