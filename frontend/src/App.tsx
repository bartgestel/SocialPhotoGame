import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Game from "./pages/Game";
import UploadPicture from "./pages/UploadPicture";
import UnlockPicture from "./pages/UnlockPicture";
import PostOverview from "./pages/PostOverview";
import PostEdit from "./pages/PostEdit";
import PuzzleTest from "./pages/PuzzleTest";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/game" element={<Game />} />
      <Route path="/upload" element={<UploadPicture />} />
      <Route path="/unlock/:shareToken" element={<UnlockPicture />} />
      <Route path="/post/:shareToken" element={<UnlockPicture />} />
      <Route path="/overview/:postId" element={<PostOverview />} />
      <Route path="/edit/:postId" element={<PostEdit />} />
      <Route path="/puzzle-test" element={<PuzzleTest />} />
    </Routes>
  );
}
