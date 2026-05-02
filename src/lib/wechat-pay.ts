import crypto from 'crypto'

// 微信支付配置
const WECHAT_PAY_CONFIG = {
  appId: process.env.WECHAT_PAY_APP_ID || '',
  mchId: process.env.WECHAT_PAY_MCH_ID || '',
  apiKey: process.env.WECHAT_PAY_API_KEY || '',
  notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
}

export const isWechatPayConfigured = () => {
  return WECHAT_PAY_CONFIG.appId && WECHAT_PAY_CONFIG.mchId && WECHAT_PAY_CONFIG.apiKey
}

// 生成随机字符串
function generateNonceStr(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 生成签名
function generateSign(params: Record<string, any>, apiKey: string): string {
  // 按字典序排序
  const sortedKeys = Object.keys(params).sort()
  
  // 拼接字符串
  const stringA = sortedKeys
    .filter(key => params[key] !== '' && params[key] !== undefined)
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  // 拼接API密钥
  const stringSignTemp = `${stringA}&key=${apiKey}`
  
  // MD5签名
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase()
}

// 生成订单号
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `PM${timestamp}${random}`.toUpperCase()
}

// 创建Native支付订单（扫码支付）
export async function createNativeOrder(
  orderId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; codeUrl?: string; error?: string }> {
  
  if (!isWechatPayConfigured()) {
    return { success: false, error: '微信支付未配置' }
  }
  
  const params: Record<string, any> = {
    appid: WECHAT_PAY_CONFIG.appId,
    mch_id: WECHAT_PAY_CONFIG.mchId,
    nonce_str: generateNonceStr(),
    body: description,
    out_trade_no: orderId,
    total_fee: Math.round(amount * 100), // 转换为分
    spbill_create_ip: '127.0.0.1',
    notify_url: WECHAT_PAY_CONFIG.notifyUrl,
    trade_type: 'NATIVE',
  }
  
  // 生成签名
  params.sign = generateSign(params, WECHAT_PAY_CONFIG.apiKey)
  
  // 转换为XML
  const xml = objectToXml(params)
  
  try {
    // 调用微信支付API
    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    })
    
    const responseText = await response.text()
    const result = xmlToObject(responseText)
    
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      return {
        success: true,
        codeUrl: result.code_url
      }
    } else {
      return {
        success: false,
        error: result.return_msg || result.err_code_des || '创建订单失败'
      }
    }
  } catch (error) {
    return { success: false, error: '网络错误' }
  }
}

// 查询订单状态
export async function queryOrder(orderId: string): Promise<{
  success: boolean
  status?: 'NOTPAY' | 'SUCCESS' | 'CLOSED' | 'REFUND'
  transactionId?: string
  error?: string
}> {
  if (!isWechatPayConfigured()) {
    return { success: false, error: '微信支付未配置' }
  }
  
  const params: Record<string, any> = {
    appid: WECHAT_PAY_CONFIG.appId,
    mch_id: WECHAT_PAY_CONFIG.mchId,
    out_trade_no: orderId,
    nonce_str: generateNonceStr(),
  }
  
  params.sign = generateSign(params, WECHAT_PAY_CONFIG.apiKey)
  
  const xml = objectToXml(params)
  
  try {
    const response = await fetch('https://api.mch.weixin.qq.com/pay/orderquery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    })
    
    const responseText = await response.text()
    const result = xmlToObject(responseText)
    
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      const tradeState = result.trade_state as 'SUCCESS' | 'NOTPAY' | 'CLOSED' | 'REFUND'
      return {
        success: true,
        status: tradeState,
        transactionId: result.transaction_id
      }
    } else {
      return {
        success: false,
        error: result.return_msg || '查询失败'
      }
    }
  } catch (error) {
    return { success: false, error: '网络错误' }
  }
}

// 对象转XML
function objectToXml(obj: Record<string, any>): string {
  let xml = '<xml>'
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== '') {
      xml += `<${key}><![CDATA[${obj[key]}]]></${key}>`
    }
  }
  xml += '</xml>'
  return xml
}

// XML转对象
function xmlToObject(xml: string): Record<string, string> {
  const result: Record<string, string> = {}
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g
  let match
  
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3]
    const value = match[2] || match[4]
    if (key && value) {
      result[key] = value
    }
  }
  
  return result
}