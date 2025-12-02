import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Game from "./pages/Game";
import UploadPicture from "./pages/UploadPicture";
import UnlockPicture from "./pages/UnlockPicture";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/upload" element={<UploadPicture />} />
      <Route path="/unlock/:shareToken" element={<UnlockPicture />} />
    </Routes>
  );
}
