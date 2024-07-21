import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'

test('only renders the title and author by default', () => {
    const user = {
        id: '1',
        username: 'user1',
        name: 'user'
    }
    const blog = {
    title: 'Some Title',
    author: 'Some Author',
    url: 'www.someurl.com',
    likes: 20,
    user: user 
  }

  render(<Blog blog={blog}  currentUser={user}/>)

  const wantedElement = screen.getByText('Some Title Some Author')

  expect(wantedElement).toBeDefined()

  const unwantedUrl = screen.queryByText('www.someurl.com')
  const unwantedLikes = screen.queryByText('20')
  expect(unwantedUrl).toBeNull()
  expect(unwantedLikes).toBeNull()
  
})
test('clicking the view button causes the url and likes to be shown', async () => {
    const user = {
        id: '1',
        username: 'user1',
        name: 'user'
    }
    const blog = {
    title: 'Some Title',
    author: 'Some Author',
    url: 'www.someurl.com',
    likes: 20,
    user: user 
  }
    
  render(<Blog blog={blog} currentUser={user}/>)

  const clicker = userEvent.setup()
  const button = screen.getByText('view')
  await clicker.click(button)

  const titleAndAuthor = screen.getByText('Some Title Some Author')

  expect(titleAndAuthor).toBeDefined()

  const unwantedUrl = screen.getByText('www.someurl.com')
  const unwantedLikes = screen.getByText('20')
  expect(unwantedUrl).toBeDefined()
  expect(unwantedLikes).toBeDefined()
  })
test('when clicking the like button twice, the event handler is called twice', async () => {
    const user = {
        id: '1',
        username: 'user1',
        name: 'user'
    }
    const blog = {
    title: 'Some Title',
    author: 'Some Author',
    url: 'www.someurl.com',
    likes: 20,
    user: user 
  }

  const mockHandler = vi.fn()
    
  render(<Blog blog={blog} currentUser={user} likeBlog={mockHandler}/>)

  const clicker = userEvent.setup()
  const button = screen.getByText('view')
  await clicker.click(button)

  const likeButton = screen.getByText('like')
  await clicker.click(likeButton)
  await clicker.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
  
  })

