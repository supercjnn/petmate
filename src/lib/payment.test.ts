/**
 * 支付服务单元测试
 */

import {
  PRODUCTS,
  createOrder,
  getOrder,
  getUserOrders,
  updateOrderStatus,
  checkVipStatus
} from '@/lib/payment'

describe('Payment Module', () => {
  const testUserId = `user_test_${Date.now()}`

  describe('PRODUCTS', () => {
    it('should have products defined', () => {
      expect(PRODUCTS.length).toBeGreaterThan(0)
    })

    it('should have required product properties', () => {
      PRODUCTS.forEach(product => {
        expect(product.id).toBeDefined()
        expect(product.name).toBeDefined()
        expect(product.price).toBeGreaterThan(0)
        expect(product.type).toBeDefined()
        expect(product.features.length).toBeGreaterThan(0)
      })
    })

    it('should have popular product marked', () => {
      const popular = PRODUCTS.find(p => p.popular)
      expect(popular).toBeDefined()
    })
  })

  describe('createOrder', () => {
    it('should create order for valid product', () => {
      const order = createOrder(testUserId, 'premium_monthly')
      
      expect(order).toBeDefined()
      expect(order!.userId).toBe(testUserId)
      expect(order!.productId).toBe('premium_monthly')
      expect(order!.status).toBe('pending')
      expect(order!.amount).toBe(2900)
    })

    it('should return null for invalid product', () => {
      const order = createOrder(testUserId, 'invalid_product')
      expect(order).toBeNull()
    })
  })

  describe('getOrder', () => {
    it('should return created order', () => {
      const created = createOrder(testUserId, 'premium_monthly')
      const retrieved = getOrder(created!.id)
      
      expect(retrieved).toBeDefined()
      expect(retrieved!.id).toBe(created!.id)
    })

    it('should return null for non-existent order', () => {
      const order = getOrder('non_existent_order')
      expect(order).toBeNull()
    })
  })

  describe('getUserOrders', () => {
    it('should return user orders', () => {
      const userId = `orders_user_${Date.now()}`
      createOrder(userId, 'premium_monthly')
      createOrder(userId, 'consultation')
      
      const orders = getUserOrders(userId)
      
      expect(orders.length).toBeGreaterThanOrEqual(2)
      expect(orders.every(o => o.userId === userId)).toBe(true)
    })

    it('should return empty array for user with no orders', () => {
      const orders = getUserOrders('user_no_orders_unique')
      expect(orders.length).toBe(0)
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status', () => {
      const order = createOrder(testUserId, 'premium_monthly')
      const result = updateOrderStatus(order!.id, 'paid', 'wechat')
      
      expect(result).toBe(true)
      const updated = getOrder(order!.id)
      expect(updated!.status).toBe('paid')
      expect(updated!.paymentMethod).toBe('wechat')
      expect(updated!.paidAt).toBeDefined()
    })

    it('should return false for non-existent order', () => {
      const result = updateOrderStatus('non_existent', 'paid')
      expect(result).toBe(false)
    })
  })

  describe('checkVipStatus', () => {
    it('should return VIP status based on paid orders', () => {
      const vipUserId = `vip_user_${Date.now()}`
      const order = createOrder(vipUserId, 'premium_monthly')
      updateOrderStatus(order!.id, 'paid', 'wechat')
      
      const status = checkVipStatus(vipUserId)
      expect(status.isVip).toBe(true)
      expect(status.daysLeft).toBeGreaterThan(0)
    })

    it('should return non-VIP for user without paid subscription', () => {
      const normalUserId = `normal_user_${Date.now()}`
      // Only create pending order
      createOrder(normalUserId, 'premium_monthly')
      
      const status = checkVipStatus(normalUserId)
      expect(status.isVip).toBe(false)
    })

    it('should return non-VIP for user with no orders', () => {
      const status = checkVipStatus('no_orders_user_unique')
      expect(status.isVip).toBe(false)
    })
  })
})