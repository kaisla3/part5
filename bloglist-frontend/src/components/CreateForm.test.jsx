import { render, screen } from '@testing-library/react'
import CreateForm from './CreateForm'
import userEvent from '@testing-library/user-event'

test('the form calls the event handler it received as props with the right details', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  const { container } = render(<CreateForm createBlog={createBlog} />)

  const titleInput = container.querySelector('#title-input')
  const authorInput = container.querySelector('#author-input')
  const urlInput = container.querySelector('#url-input')
  const sendButton = screen.getByText('create')

  await user.type(titleInput, 'New Title')
  await user.type(authorInput, 'New Author')
  await user.type(urlInput, 'www.url.com')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('New Title')
  expect(createBlog.mock.calls[0][0].author).toBe('New Author')
  expect(createBlog.mock.calls[0][0].url).toBe('www.url.com')
})