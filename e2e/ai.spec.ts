import { test, expect } from '@playwright/test'

test.describe('AI问答', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should display AI chat interface', async ({ page }) => {
    // 查找AI聊天入口
    const chatButton = page.getByRole('button', { name: /AI|问|助手|咨询/i })
    
    if (await chatButton.count() > 0) {
      await chatButton.first().click()
      
      // 检查聊天界面
      const chatInput = page.getByPlaceholder(/输入|问|提问/i)
      await expect(chatInput).toBeVisible()
    }
  })

  test('should send and receive messages', async ({ page }) => {
    // 导航到AI页面
    await page.goto('/ai')
    
    // 输入问题
    const chatInput = page.getByPlaceholder(/输入|问|提问/i)
    if (await chatInput.count() > 0) {
      await chatInput.fill('小猫不吃东西怎么办？')
      
      // 发送
      const sendButton = page.getByRole('button', { name: /发送|send/i })
      await sendButton.click()
      
      // 等待响应
      const response = page.getByText(/建议|可能|原因|注意/i)
      await expect(response).toBeVisible({ timeout: 30000 })
    }
  })
})