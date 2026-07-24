import { useParams } from "react-router" // imports react router function "useParams" to read information from the URL

function PostDetails() {
  const { id } = useParams() // reads dynamic information from the URL to treat as the post ID

  return (
    <main className="page">
      <h1>Post Details</h1>
      <p>You are currently viewing post number {id}.</p> {/*displays the post ID */}
    </main>
  )
}

export default PostDetails