import { test, expect } from '@playwright/test'

test.describe('新手引导', () => {
  test('should complete onboarding flow', async ({ page }) => {
    await page.goto('/onboarding')
    
    // 步骤1: 欢迎
    const welcomeText = page.getByText(/欢迎|新手|养猫/i)
    await expect(welcomeText).toBeVisible()
    
    // 点击开始
    const startButton = page.getByRole('button', { name: /开始|下一步|next/i })
    if (await startButton.count() > 0) {
      await startButton.first().click()
    }
    
    // 步骤2: 填写猫咪信息
    const catNameInput = page.getByPlaceholder(/猫咪名字|昵称/i)
    if (await catNameInput.count() > 0) {
      await catNameInput.fill('小白')
    }
    
    // 继续下一步
    const nextButton = page.getByRole('button', { name: /下一步|继续|next/i })
    if (await nextButton.count() > 0) {
      await nextButton.first().click()
    }
    
    // 最终应该跳转到dashboard
    await expect(page).toHaveURL(/\/(dashboard|home)/, { timeout: 10000 })
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/onboarding')
    
    // 尝试跳过必填字段
    const submitButton = page.getByRole('button', { name: /完成|提交|submit/i })
    if (await submitButton.count() > 0) {
      await submitButton.click()
      
      // 应该显示错误提示
      const errorMessage = page.getByText(/请填写|必填|required/i)
      await expect(errorMessage).toBeVisible()
    }
  })
})