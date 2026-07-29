import { useEffect, useState } from "react" // importing hooks to use react feature useState (to remember component information) and useEffect (allows component to sync with an external system like supabase)
import { Link } from "react-router" // Link handles client side navigation without performing a full page reoload
import { supabase } from "../client" // imports the object created in client.js

function Home() {
  const [posts, setPosts] = useState([]) // posts will be stored as a list, so I begin with an empty array
  const [loading, setLoading] = useState(true) // state begins with 'true' because the page is waiting for Supabase when it first opens (it is loading)
  const [errorMessage, setErrorMessage] = useState("") // error state / error message handling

  useEffect(() => { // so this arrow function contains the work React should perform when the effect runs...
    const fetchPosts = async () => { // we use async for this function because the database communication is not immediate
      const { data, error } = await supabase // await allows us to wait for the result within that function, as we await for supabase
        .from("posts") // selects the database table that needs to be used (from supabase)
        .select("*") // the asterisk generally means "select every column" in SQL-speak
        .order("created_at", { ascending: false }) // this sorts the returned posts in a descending order so that newer posts appear before older posts

      if (error) { // in the case of there being an error during the data fetch, this message is prompted
        console.error(error) // this prints within the dev console for the sake of debugging
        setErrorMessage("The posts could not be loaded.")
      } else { // if there was no error...
        setPosts(data) // stores the returned rows into the "posts" state.
      }

      setLoading(false) // whether there was an error or the operation was succesful, loading has completed, therefore, is false
    }

    fetchPosts() // function call for previously created function
  }, []) // closes the useEffect call, and the dependency array '[]' tells React that the effect does not depend on changing component values

  if (loading) { // when loading is true... loading return
    return ( // returns to the loading interface!
      <main className="page">
        <p>Loading posts...</p> 
      </main>
    )
  }

  if (errorMessage) { // the error return
    return (
      <main className="page">
        <p>{errorMessage}</p>
      </main>
    )
  }

  return ( // below here is the normal homepage visual
    <main className="page">
      <h1>☆ Welcome to IndieSticks ☆</h1>
      <p>a niche community for indie game developers of varying skill!</p>

      <section className="posts-section">
        <h2>Community Posts</h2>

        {posts.length === 0 ? ( 
          <p>No posts have been created yet.</p> 
        ) : (
          <div className="posts-list"> 
{posts.map((post) => (
  <Link
    className="post-link"
    to={`/post/${post.id}`}
    key={post.id}
  >
    <article className="post-card">
      <p>
        Created: {new Date(post.created_at).toLocaleString()}
      </p>

      <h3>{post.title}</h3>
      <p>Upvotes: {post.upvotes}</p>
    </article>
  </Link>
))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Home