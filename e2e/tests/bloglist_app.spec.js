const { test, describe, beforeEach, expect } = require('@playwright/test')
const { loginWith, createBlog, likeBlog } = require('./helper')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('/api/testing/reset')
        await request.post('/api/users', {
        data: {
            name: 'Matti Luukkainen',
            username: 'mluukkai',
            password: 'salainen'
        }
        })
        await request.post('/api/users', {
            data: {
                name: 'Superuser',
                username: 'root',
                password: 'salainen'
            }
            })
        await page.goto('/')
      })
    test('Login from is shown', async ({ page }) => {
        const locator = await page.getByText('log in to application')
        await expect(locator).toBeVisible()
      })
      describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await loginWith(page, 'mluukkai', 'salainen')
            const messageDiv = await page.locator('.message')
            await expect(messageDiv).toContainText('Matti Luukkainen logged in')
            await expect(messageDiv).toHaveCSS('border-style', 'solid')
            await expect(messageDiv).toHaveCSS('color', 'rgb(0, 128, 0)')
            await expect(page.getByText('Matti Luukkainen logged in logout')).toBeVisible()
        })
    
        test('fails with wrong credentials', async ({ page }) => {
            await loginWith(page, 'mluukkai', 'wrong')
            const errorDiv = await page.locator('.error')
            await expect(errorDiv).toContainText('wrong username or password')
            await expect(errorDiv).toHaveCSS('border-style', 'solid')
            await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
            await expect(page.getByText('Matti Luukkainen logged in logout')).not.toBeVisible()
        })
      })
      describe('When logged in', () => {
        beforeEach(async ({ page }) => {
            await loginWith(page, 'mluukkai', 'salainen')
        })
      
        test('a new blog can be created', async ({ page }) => {
          await createBlog(page, 'Title', 'Author', 'www.url.com')
          await expect(page.getByText('Title Author')).toBeVisible()
        })
        describe('and several blogs exists', () => {
            beforeEach(async ({ page }) => {
              await createBlog(page, 'first blog', 'Author One', 'www.url1.com')
              await createBlog(page, 'second blog', 'Author Two', 'www.url2.com')
              await createBlog(page, 'third blog', 'Author Three', 'www.url3.com')
            })
        
            test('one of those can be liked', async ({ page }) => {
              await likeBlog(page, 'second blog Author Two', 'www.url2.com', 0)
            })
            test('user who added the blog can delete the blog', async ({ page }) => {
                const oneBlog = await page.getByText('second blog')
                const oneBlogElement = await oneBlog.locator('..')
              
                await oneBlogElement.getByRole('button', { name: 'view' }).click()
                await expect(oneBlogElement.getByText('Matti Luukkainen')).toBeVisible()
                page.on('dialog', dialog => dialog.accept())
                await oneBlogElement.getByRole('button', { name: 'remove' }).click()
                await expect(page.getByText('second blog Author Two')).not.toBeVisible()
                const messageDiv = await page.locator('.message')
                await expect(messageDiv).toContainText('Deleted second blog by Author Two')
                await expect(messageDiv).toHaveCSS('border-style', 'solid')
                await expect(messageDiv).toHaveCSS('color', 'rgb(0, 128, 0)')

              })
            describe('and several users create blogs', () => {
                beforeEach(async ({ page }) => {
                    await page.getByRole('button', { name: 'logout' }).click()
                    await loginWith(page, 'root', 'salainen')
                    await createBlog(page, 'fourth blog', 'Author Four', 'www.url4.com')
                    await createBlog(page, 'fifth blog', 'Author Five', 'www.url5.com')
                    await createBlog(page, 'sixth blog', 'Author Six', 'www.url6.com')
                })
            
                test('only the user who added the blog sees the delete button', async ({ page }) => {
                  const elsesBlog = await page.getByText('second blog')
                  const elsesBlogElement = await elsesBlog.locator('..')
                
                  await elsesBlogElement.getByRole('button', { name: 'view' }).click()
                  await expect(elsesBlogElement.getByText('www.url2.com')).toBeVisible()
                  await expect(elsesBlogElement.getByText('Matti Luukkainen')).toBeVisible()
                  await expect(elsesBlogElement.getByText('remove')).not.toBeVisible()
                  await elsesBlogElement.getByRole('button', { name: 'hide' }).click()

                  const ownBlog = await page.getByText('fourth blog')
                  const ownBlogElement = await ownBlog.locator('..')

                  await ownBlogElement.getByRole('button', { name: 'view' }).click()
                  await expect(ownBlogElement.getByText('www.url4.com')).toBeVisible()
                  await expect(ownBlogElement.getByText('Superuser')).toBeVisible()
                  await expect(ownBlogElement.getByText('remove')).toBeVisible()
                })
                test('blogs are arranged in the order according to the likes', async ({ page }) => {
                    await likeBlog(page, 'second blog Author Two', 'www.url2.com', 0)
                    await likeBlog(page, 'second blog Author Two', 'www.url2.com', 1)
                    await likeBlog(page, 'second blog Author Two', 'www.url2.com', 2)
                    await likeBlog(page, 'second blog Author Two', 'www.url2.com', 3)
                    await likeBlog(page, 'second blog Author Two', 'www.url2.com', 4)
                    await likeBlog(page, 'third blog Author Three', 'www.url3.com', 0)
                    await likeBlog(page, 'third blog Author Three', 'www.url3.com', 1)
                    await likeBlog(page, 'third blog Author Three', 'www.url3.com', 2)
                    await likeBlog(page, 'third blog Author Three', 'www.url3.com', 3)
                    await likeBlog(page, 'sixth blog Author Six', 'www.url6.com', 0)
                    await likeBlog(page, 'sixth blog Author Six', 'www.url6.com', 1)
                    await likeBlog(page, 'sixth blog Author Six', 'www.url6.com', 2)
                    await likeBlog(page, 'fourth blog Author Four', 'www.url4.com', 0)
                    await likeBlog(page, 'fourth blog Author Four', 'www.url4.com', 1)
                    await likeBlog(page, 'first blog Author One', 'www.url1.com', 0)

                    await expect(page.getByTestId('blogListItem')).toHaveText(['second blog Author Two view', 'third blog Author Three view', 'sixth blog Author Six view', 'fourth blog Author Four view', 'first blog Author One view', 'fifth blog Author Five view'])
                  })
              })
          })
      })
})
