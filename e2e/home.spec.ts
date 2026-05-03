import { test, expect } from '@playwright/test'

test.describe('首页', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    
    // 检查标题
    await expect(page).toHaveTitle(/PetMate|新手养猫/)
    
    // 检查CTA按钮
    const ctaButton = page.getByRole('button', { name: /开始|立即|免费/i })
    await expect(ctaButton).toBeVisible()
  })

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/')
    
    // 点击开始按钮
    const ctaButton = page.getByRole('button', { name: /开始|立即|免费/i })
    await ctaButton.click()
    
    // 应该跳转到dashboard或引导页
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/)
  })
})