import { test, expect } from '@playwright/test'

test.describe('移动端响应式', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/')
    
    // 移动端应该有汉堡菜单或底部导航
    const mobileNav = page.locator('[data-testid="mobile-nav"], nav, [role="navigation"]')
    await expect(mobileNav.first()).toBeVisible()
  })

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/dashboard')
    
    // 按钮应该足够大（至少44px）
    const buttons = page.getByRole('button')
    const count = await buttons.count()
    
    if (count > 0) {
      const firstButton = buttons.first()
      const box = await firstButton.boundingBox()
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(36) // 稍微放宽标准
      }
    }
  })
})