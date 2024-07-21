const { expect } = require('@playwright/test')

const loginWith = async (page, username, password)  => {
    await page.getByTestId('username').fill(username)
    await page.getByTestId('password').fill(password)
    await page.getByRole('button', { name: 'login' }).click()
  }

const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByTestId('title').fill(title)
    await page.getByTestId('author').fill(author)
    await page.getByTestId('url').fill(url)
    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText(`${title} ${author}`).waitFor()
  }
const likeBlog = async (page, titleAndAuthor, url, likes) => {
    const oneBlog = await page.getByText(titleAndAuthor)
    const oneBlogElement = await oneBlog.locator('..')
            
    await oneBlogElement.getByRole('button', { name: 'view' }).click()
    await expect(oneBlogElement.getByText(url)).toBeVisible()
    await expect(oneBlogElement.getByText(`${likes} like`)).toBeVisible()

    await oneBlogElement.getByRole('button', { name: 'like' }).click()
    await expect(oneBlogElement.getByText(`${likes + 1} like`)).toBeVisible()
    await oneBlogElement.getByRole('button', { name: 'hide' }).click()
  }

   
  export { loginWith, createBlog, likeBlog }