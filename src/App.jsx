import { Link, Route, Routes } from "react-router"
import "./App.css" // bring CSS rules into this file
import Home from "./pages/Home.jsx"
import CreatePost from "./pages/CreatePost.jsx"
import PostDetails from "./pages/PostDetails.jsx"

function App() { // App function represents the entire visible application
  return (
    <div className="app">
      <header className="site-header">
        <Link className="site-title" to="/">
          ☆ IndieSticks ☆
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/create">Create Post</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostDetails />} />
      </Routes>
    </div>
  )
}

export default App // makes the App component available to OTHER files