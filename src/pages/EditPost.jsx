import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { supabase } from "../client"

function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error(error)
        setLoadError("The post could not be loaded.")
      } else {
        setTitle(data.title)
        setContent(data.content || "")
        setImageUrl(data.image_url || "")
      }

      setLoading(false)
    }

    fetchPost()
  }, [id])

  const updatePost = async (event) => {
    event.preventDefault()

    const cleanedTitle = title.trim()
    const cleanedContent = content.trim()
    const cleanedImageUrl = imageUrl.trim()

    if (!cleanedTitle) {
      setSubmitError("Please enter a post title.")
      return
    }

    setSubmitError("")
    setSubmitting(true)

    const { error } = await supabase
      .from("posts")
      .update({
        title: cleanedTitle,
        content: cleanedContent || null,
        image_url: cleanedImageUrl || null,
      })
      .eq("id", id)

    if (error) {
      console.error(error)
      setSubmitError("The post could not be updated.")
      setSubmitting(false)
      return
    }

    navigate(`/post/${id}`)
  }

  if (loading) {
    return (
      <main className="page">
        <p>Loading post...</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="page">
        <p className="action-error">{loadError}</p>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Edit Post</h1>

      <form className="post-form" onSubmit={updatePost}>
        <label htmlFor="editTitle">Post Title</label>

        <input
          id="editTitle"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          required
        />

        <label htmlFor="editContent">
          Post Content
        </label>

        <textarea
          id="editContent"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
        />

        <label htmlFor="editImageUrl">
          External Image URL
        </label>

        <input
          id="editImageUrl"
          type="url"
          value={imageUrl}
          onChange={(event) =>
            setImageUrl(event.target.value)
          }
        />

        {submitError && (
          <p className="action-error">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting
            ? "Saving Changes..."
            : "Save Changes"}
        </button>
      </form>
    </main>
  )
}

export default EditPost