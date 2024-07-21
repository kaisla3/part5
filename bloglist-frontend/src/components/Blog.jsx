import { useState } from 'react'

const Blog = ({ blog, likeBlog, deleteBlog, currentUser }) => {
  const [show, setShow] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const handleLike = (event) => {
    event.preventDefault()
    likeBlog(blog.id, (blog.likes + 1))
  }

  const handleDelete = () => {
    deleteBlog(blog)
  }

  return(
    <div style={blogStyle} className='blog'>
      <div data-testid='blogListItem'>
        {blog.title} {blog.author} <button onClick = {() => setShow(!show)}>{show ? 'hide' : 'view'}</button>
      </div>
      {show ? 
      <div>
      <div>{blog.url}</div>
      <div>{blog.likes} <button onClick = {handleLike}>like</button></div>
      <div>{blog.user.name}</div>
      {currentUser.username === blog.user.username && <button onClick = {handleDelete}>remove</button>}
    </div>
    : ''}
    </div>
  )
}

export default Blog