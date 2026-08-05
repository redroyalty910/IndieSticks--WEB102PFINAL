import { useEffect, useState } from "react" // useEffect to request the post from Supabase, useState to remember the post, laoding status, and error message
import { Link, useNavigate, useParams } from "react-router" // imports react router function "useParams" to read information from the URL, Link creates the Edit Post link,  and useNavigate lets javaScript redirect the user
import { supabase } from "../client"

function PostDetails() {
  const { id } = useParams() // reads dynamic information from the URL to treat as the post ID
  const navigate = useNavigate() // navigate function that will return the user to the home page after deleting a post

  const [post, setPost] = useState(null) // will store post objects, starts as null because there is initially no post
  const [loading, setLoading] = useState(true) // page begins by WAITING for supabase, therefore, is true
  const [errorMessage, setErrorMessage] = useState("") // begins as an empty string because nothing has gone wrong yet
  const [upvoting, setUpvoting] = useState(false) // remembers whether an upvote request is currently happening, false because nobody has clicked the button yet
  const [upvoteError, setUpvoteError] = useState("") // stores a specific message for the case of an error during an upvote
 
  const [comments, setComments] = useState([]) // comments will store all comments belonging to a post
  const [commentsLoading, setCommentsLoading] = useState(true) // this remembers whether the app is still waiting for the comments request to finish
  const [commentsError, setCommentsError] = useState("") // stores a specific message for the case of an error during comment load failure
  const [commentInput, setCommentInput] = useState("") // lets the component remember changing information, like form input
  const [submittingComment, setSubmittingComment] = useState(false) // this remembers whether or not the app is currently waiting for supabase to save a comment
  const [commentSubmitError, setCommentSubmitError] = useState("") // this stores an error related specifically to submitting a comment

  const [deleting, setDeleting] = useState(false) // remembers whether supabase is currently processing a delete request
  const [deleteError, setDeleteError] = useState("") // stores an error message specifically relatedto deleting the post

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

  useEffect(() => { // this is a SECOND useEffect, where we are now fetching COMMENTS
    const fetchComments = async () => {
      const { data, error } = await supabase // waits for supabase to extract two properties; data (comments returned) and error (information about a failed request) 
        .from("comments") // chooses the comments table
        .select("*") // retrieves every column from each matching comment
        .eq("post_id", id) // retrieve comments belonging to only the current post
        .order("created_at", { ascending: true }) // aranges the comments from oldest to newest

      if (error) { // error handling case
        console.error(error)
        setCommentsError("The comments could not be loaded.")
      } else { // when no error exists...
        setComments(data) // store the returned rows inside the comments state
      }

      setCommentsLoading(false) // the reqeuest is finished and not loading
    }

    fetchComments()
  }, [id]) // since comments depend on the ID of the post, [id] appears once again

  const handleCommentSubmit = async (event) => { // function decleration is async because it must wait for Supabase to respond, even represents the form-submission event produced by the browser
    event.preventDefault() // this line prevents a full reload upon submission of a form on the page

    const cleanedComment = commentInput.trim() // simply removes spaces fromthe beginning / end of the comment

    if (!cleanedComment) { // empty comment rejection
      setCommentSubmitError("Please enter some words or something, you can't just send nothing here, tim won't allow it.")
      return
    }

    setCommentSubmitError("") // removes any previous submission error
    setSubmittingComment(true) // records that the comment is currently being submitted

    const { data, error } = await supabase // supabase request, that awaits supabase for data and further instruction
      .from("comments") // from the comments table
      .insert({ // insert one new row into the database
        post_id: Number(id), // the left side is the column name, the right side is the post ID from the URL converted into a number
        content: cleanedComment,
      })
      .select() // without .select(), the comment would be saved, but the data variable would not contain the new comment object
      .single() // and because we inserted exactly ONE comment, .single() asks supabase to return ONE object instead of an array

    if (error) { // error handling
      console.error(error)
      setCommentSubmitError("The comment could not be added.")
      setSubmittingComment(false)
      return
    }

    setComments((currentComments) => [ // react provides the most recent value of the comments array to this function
      ...currentComments, // copies every existing comment into it
      data, // then adds the newly created comment to the end
    ])

    setCommentInput("")
    setSubmittingComment(false)
  }

  const handleUpvote = async () => { // function decleration that is async because it must wait for Supabase
    if (!post || upvoting) { // safety checks for a post OR if there is an upvote already being processed
      return
    }

    setUpvoteError("") // clear the previous upvote error before another attempt
    setUpvoting(true) // tell React that there is an upvote request happening

    const newUpvoteCount = post.upvotes + 1 // calculate the new upvote count, and store it in a new variable

    const { error } = await supabase // then update Supabase with the new upvote
      .from("posts") // the table that we are changing
      .update({ upvotes: newUpvoteCount }) // tells supabase which column should be changed
      .eq("id", id) // limits the update to the row whose database ID equals the ID from the current URL

    if (error) { // case for error handling
      console.error(error)
      setUpvoteError("The upvote could not be added.")
      setUpvoting(false)
      return
    }

    setPost({ // will only change the upvote count
      ...post, // spread syntax "..." copies all existing properties from the current post
      upvotes: newUpvoteCount, // replaces only the copied upvotes value
    })

    setUpvoting(false) // finish the request by re-enabling the upvote button
  }

  const handleDeletePost = async () => { // runs when the DELETE POST button is clicked, and async because it must wait for supabase
    if (deleting) { // checks whether another deletion request is happening already
      return
    }

    const confirmed = window.confirm( // opens the browsers built-in confirmation popup and stores either true or false
      "Are you sure you want to delete this post?"
    )

    if (!confirmed) { // if the user pressses cancel... confirmed will be FALSE
      return
    }

    setDeleteError("")
    setDeleting(true)

    const { error: commentsDeleteError } = await supabase // awaits supabase and renames the proper returned error
      .from("comments") // chooses the comments table
      .delete() // matching rows should be deleted
      .eq("post_id", Number(id)) // deletes comments whose post_id equals the current posts ID

    if (commentsDeleteError) { // checks whether deleting the comments failed or not
      console.error(commentsDeleteError)
      setDeleteError("The post's comments could not be deleted.")
      setDeleting(false) // records that the deletion attempt has finished and re-enables the button
      return // function ends so that the post itself is not deleted
    }

    const { error: postDeleteError } = await supabase
      .from("posts") // chooses the posts table
      .delete() // tells supabase to delete the matching post
      .eq("id", id) // limits deletion to the post whose database ID matches the ID in the URL

    if (postDeleteError) { // checks whether deleting the post failed
      console.error(postDeleteError)
      setDeleteError("The post could not be deleted.")
      setDeleting(false) // records taht the deletion attempt was a FAIL and re-enables the button
      return
    }

    navigate("/") // back to home after deletion
  }

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

        <div className="upvote-area">
          <button
            className="upvote-button"
            type="button"
            onClick={handleUpvote}
            disabled={upvoting}
          >
            {upvoting ? "Upvoting..." : "☆ Upvote"}
          </button>

          <span>{post.upvotes} upvotes</span>
        </div>

        {upvoteError && (
          <p className="action-error">{upvoteError}</p>
        )}

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

        <div className="post-actions">
          <Link
            className="edit-link"
            to={`/edit/${post.id}`}
          >
            Edit Post
          </Link>

          <button
            className="delete-button"
            type="button"
            onClick={handleDeletePost}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Post"}
          </button>
        </div>

        {deleteError && (
          <p className="action-error">
            {deleteError}
          </p>
        )}
      </article>

      <section className="comments-section">
        <h2>Comments</h2>

        <form
          className="comment-form"
          onSubmit={handleCommentSubmit}
        >
          <label htmlFor="commentInput">
            Say something down below!
          </label>

          <textarea
            id="commentInput"
            value={commentInput}
            onChange={(event) =>
              setCommentInput(event.target.value)
            }
            placeholder="Write a comment..."
            required
          />

          {commentSubmitError && (
            <p className="action-error">
              {commentSubmitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submittingComment}
          >
            {submittingComment
              ? "Posting Comment..."
              : "Post Comment"}
          </button>
        </form>

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : commentsError ? (
          <p className="action-error">{commentsError}</p>
        ) : comments.length === 0 ? (
          <p>There is NOTHING being said!</p>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <article className="comment-card" key={comment.id}>
                <p className="comment-date">
                  {new Date(comment.created_at).toLocaleString()}
                </p>

                <p className="comment-content">{comment.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default PostDetails