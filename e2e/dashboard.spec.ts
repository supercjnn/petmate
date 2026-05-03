import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // 直接导航到dashboard
    await page.goto('/dashboard')
  })

  test('should display day cards', async ({ page }) => {
    // 检查卡片容器
    const cardContainer = page.locator('[data-testid="day-card"]').first()
    await expect(cardContainer).toBeVisible()
  })

  test('should show progress indicator', async ({ page }) => {
    // 检查进度条或进度指示器
    const progress = page.locator('[data-testid="progress"], [role="progressbar"]').first()
    await expect(progress).toBeVisible()
  })

  test('should navigate between days', async ({ page }) => {
    // 检查日期导航
    const nextButton = page.getByRole('button', { name: /下一天|next/i })
    const prevButton = page.getByRole('button', { name: /上一天|prev|前一天/i })
    
    // 至少有一个导航按钮
    const hasNavigation = (await nextButton.count()) > 0 || (await prevButton.count()) > 0
    expect(hasNavigation).toBeTruthy()
  })
})