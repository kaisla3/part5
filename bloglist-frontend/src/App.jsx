import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import CreateForm from './components/CreateForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService
      .getAll().then(blogs =>
        setBlogs( blogs )
      )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBloglistappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setMessage(`${user.name} logged in`)
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } catch (exception) {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  if (!blogs) {
    return null
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setMessage(`a new blog ${blogObject.title} by ${blogObject.author} added`)
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch(error => {
        const someErrorMessage = error.response?.data?.error || 'An error occurred'
        setErrorMessage(someErrorMessage)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        console.log(someErrorMessage)
      })
  }

  const loginForm = () => (
    <div>
      <h2>log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
        username
          <input
            data-testid='username'
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
        password
          <input
            data-testid='password'
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  const handleLogout = () => {
    window.localStorage.clear()
    setUser(null)
    setMessage(`${user.name} logged out`)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  const likeBlog = (id, newLikes) => {
    const blog = blogs.find(n => n.id === id)
    const likedBlog = { ...blog, likes: newLikes }
    blogService
      .update(id, likedBlog)
      .then(returnedBlog => {
        setBlogs(blogs.map(blog => blog.id !== id ? blog : returnedBlog))
        setMessage(`${blog.title} by ${blog.author} was liked`)
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch(error => {
        const someErrorMessage = error.response?.data?.error || 'An error occurred'
        setErrorMessage(someErrorMessage)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        console.log(someErrorMessage)
      })
  }

  const compareLikes = (blogA, blogB) => {
    return blogB.likes - blogA.likes
  }

  const deleteBlog = (blogObject) => {
    if(window.confirm(`Remove blog ${blogObject.title} by ${blogObject.author}`)){
      blogService
        .remove(blogObject.id)
        .then(returnedBlog => {
          setBlogs(blogs.filter(blog => blog.id !== blogObject.id))
          setMessage(
            `Deleted ${blogObject.title} by ${blogObject.author}`
          )
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
    }
  }

  const blogsInOrder = blogs.sort(compareLikes)

  return (
    <div>
      <Notification message={message} type="message"/>
      <Notification message={errorMessage} type="error"/>
      {user === null ?
        loginForm() :
        <div>
          <h2>blogs</h2>
          <p>{user.name} logged in <button onClick = {() => handleLogout()}>logout</button></p>
          <Togglable buttonLabel='new blog' ref={blogFormRef}>
            <CreateForm
              createBlog={addBlog}
            />
          </Togglable>
          {blogsInOrder.map(blog =>
            <Blog key={blog.id} blog={blog} likeBlog={likeBlog} deleteBlog={deleteBlog} currentUser={user} />
          )}
        </div>
      }
    </div>
  )
}

export default App