import { useEffect, useState } from "react" // importing hooks to use react feature useState (to remember component information) and useEffect (allows component to sync with an external system like supabase)
import { Link } from "react-router" // Link handles client side navigation without performing a full page reoload
import { supabase } from "../client" // imports the object created in client.js

function Home() {
  const [posts, setPosts] = useState([]) // posts will be stored as a list, so I begin with an empty array
  const [loading, setLoading] = useState(true) // state begins with 'true' because the page is waiting for Supabase when it first opens (it is loading)
  const [errorMessage, setErrorMessage] = useState("") // error state / error message handling
  const [searchInput, setSearchInput] = useState("") // holds whatever the user has typed into the search field, useState begins with an empty string
  const [orderBy, setOrderBy] = useState("created_at") // stores the database column currently controlling the order, and begins at "created_at"  so posts are initially sorted from newest to oldest

  useEffect(() => { // so this arrow function contains the work React should perform when the effect runs...
    const fetchPosts = async () => { // we use async for this function because the database communication is not immediate
      setLoading(true) // start a fresh loading state
      setErrorMessage("") // and remove any previous fetching error whenever the sorting option changes
      
      const { data, error } = await supabase // await allows us to wait for the result within that function, as we await for supabase
        .from("posts") // selects the database table that needs to be used (from supabase)
        .select("*") // the asterisk generally means "select every column" in SQL-speak
        .order(orderBy, { ascending: false }) // sorts by whichever column name is stored in orderBy

      if (error) { // in the case of there being an error during the data fetch, this message is prompted
        console.error(error) // this prints within the dev console for the sake of debugging
        setErrorMessage("The posts could not be loaded.")
      } else { // if there was no error...
        setPosts(data) // stores the returned rows into the "posts" state.
      }

      setLoading(false) // whether there was an error or the operation was succesful, loading has completed, therefore, is false
    }

    fetchPosts() // function call for previously created function
  }, [orderBy]) // closes the useEffect call, and the effect depends on the value of orderBy

const filteredPosts = posts.filter((post) => // variable filteredPosts that contains ONLY the posts whose titles matched the title search
  post.title.toLowerCase().includes(searchInput.toLowerCase()) // converts the title to lowercase to better narrow search results
)


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
      
        <h1 className="welcome-heading">
         <span className="welcome-star">☆</span>

         <span className="moving-rainbow-text">
           Welcome to
         </span>

          <span className="welcome-brand">
              IndieSticks
          </span>

         <span className="welcome-star">☆</span>
        </h1>

      <p>a niche community for indie game developers of varying skill!</p>

<div className="feed-controls">
  <div className="control-group">
    <label htmlFor="searchInput">Search Posts</label>

    <input
      id="searchInput"
      type="text"
      value={searchInput}
      onChange={(event) => setSearchInput(event.target.value)}
      placeholder="Search by title!!!"
    />
  </div>

  <div className="control-group">
    <label htmlFor="orderBy">Sort Posts</label>

    <select
      id="orderBy"
      value={orderBy}
      onChange={(event) => setOrderBy(event.target.value)}
    >
      <option value="created_at">Newest</option>
      <option value="upvotes">Most Upvoted</option>
    </select>
  </div>
</div>

      <section className="posts-section">
        <h2>Community Posts</h2>

        {posts.length === 0 ? (
         <p>No posts have been created yet.</p>
        ) : filteredPosts.length === 0 ? (
         <p>No posts match your search.</p>
        ) : (
          <div className="posts-list">
           {filteredPosts.map((post) => (
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