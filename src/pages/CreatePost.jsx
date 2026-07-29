import { useState } from "react" // allows the component to remember values
import { useNavigate } from "react-router" // lets javascript change the current page after something happens
import { supabase } from "../client" // imports the database connection form

function CreatePost() {
  const [title, setTitle] = useState("") // stores the title, changes the title, ("") means that it begins as an empty string
  const [content, setContent] = useState("") // stores optional body text
  const [imageUrl, setImageUrl] = useState("") // stores optional image address
  const [errorMessage, setErrorMessage] = useState("") // stores message when a submission fails
  const [submitting, setSubmitting] = useState(false) // stores whether the app is waiting for supabase to create the post

  const navigate = useNavigate() // store useNavigate() within function navigate

  const createPost = async (event) => { // runs when the form is submitted, recieves event when the browser creates an event object relating to submission
    event.preventDefault() // this line prevents the browser from refreshing before the app finishes the processing request

    setErrorMessage("") // removes any previous error message
    setSubmitting(true) // and records that the submission has begun

    const { error } = await supabase // this is the insert request, which requests that the function waits until supabase finishes the insert request
      .from("posts")
      .insert({
        title: title,
        content: content || null,
        image_url: imageUrl || null,
        upvotes: 0,
      })

    if (error) { // handling a failed insert, 
      console.error(error) // displays tecehnical error in console
      setErrorMessage("The post could not be created.") // displays a simpler error to the user
      setSubmitting(false)
      return
    }

    navigate("/") // back to the home-page, only upon a successful insert without an error
  }

  return (
    <main className="page">
      <h1>Create Post</h1>

      <form className="post-form" onSubmit={createPost}>
        <label htmlFor="title">Post Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <label htmlFor="content">Post Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        <label htmlFor="imageUrl">External Image URL</label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />

        {errorMessage && <p>{errorMessage}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating Post..." : "Create Post"}
        </button>
      </form>
    </main>
  )
}

export default CreatePost