import { useEffect, useState } from "react" // useEffect to request the post from Supabase, useState to remember the post, laoding status, and error message
import { useParams } from "react-router" // imports react router function "useParams" to read information from the URL
import { supabase } from "../client"

function PostDetails() {
  const { id } = useParams() // reads dynamic information from the URL to treat as the post ID

  const [post, setPost] = useState(null) // will store post objects, starts as null because there is initially no post
  const [loading, setLoading] = useState(true) // page begins by WAITING for supabase, therefore, is true
  const [errorMessage, setErrorMessage] = useState("") // begins as an empty string because nothing has gone wrong yet

  useEffect(() => { // this effect runs when the post page appears
    const fetchPost = async () => { // is an asyncronous function because it MUST wait for supabase
      const { data, error } = await supabase // the data request
        .from("posts") // posts is the table
        .select("*") // * means every column
        .eq("id", id) // eq() = means equal
        .single() // .single() gives us the object directly instead of the contrary where supabase would normally return an array

      if (error) { // error handling
        console.error(error)
        setErrorMessage("This post could not be loaded.")
      } else {
        setPost(data)
      }

      setLoading(false) // request is finished whether it succeeded or failed
    }

    fetchPost() // function call
  }, [id]) // id is in the dependency array because our effect depends on the current psot ID

  if (loading) { // if loading ... display text
    return (
      <main className="page">
        <p>Loading post...</p>
      </main>
    )
  }

  if (errorMessage) { // if there's an error, display the stored error message
    return (
      <main className="page">
        <p>{errorMessage}</p>
      </main>
    )
  }

  if (!post) { // if there's no post, display text
    return (
      <main className="page">
        <p>Post not found.</p>
      </main>
    )
  }

  return (
 <main className="page">
      <article className="post-details">
        <p className="post-date">
          Created: {new Date(post.created_at).toLocaleString()}
        </p>

        <h1>{post.title}</h1>

        <p>Upvotes: {post.upvotes}</p>

        {post.content && (
          <p className="post-content">{post.content}</p>
        )}

        {post.image_url && (
          <img
            className="post-image"
            src={post.image_url}
            alt={`Image attached to ${post.title}`}
          />
        )}
      </article>
    </main>
  )
}

export default PostDetails