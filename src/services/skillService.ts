import axios from 'axios'

const API_BASE_URL = '/api'
const TIMEOUT = 30000

export interface SkillResult {
  success: boolean
  result?: string
  error?: string
}

export async function callSkill(
  skillName: string,
  parameters: Record<string, any> = {},
  messageId?: string,
  agentId?: string
): Promise<SkillResult> {
  console.log(`[SkillService] 开始调用技能: ${skillName}, 参数:`, parameters)
  
  try {
    const response = await axios.post(`${API_BASE_URL}/skills/call`, {
      skill_name: skillName,
      parameters: {
        ...parameters,
        messageId,
        agentId
      }
    }, {
      timeout: TIMEOUT
    })
    
    console.log(`[SkillService] 技能 ${skillName} 返回:`, response.data)
    return response.data
  } catch (error) {
    console.error(`[SkillService] 调用技能 ${skillName} 失败:`, error)
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: '请求超时'
        }
      }
      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          error: '网络错误，请确保后端服务正在运行 (npm run backend)'
        }
      }
      return {
        success: false,
        error: error.response?.data?.error || error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function executeSkill(
  skillName: string,
  userInput: string
): Promise<string> {
  const result = await callSkill(skillName, { input: userInput })
  if (result.success && result.result) {
    return result.result
  }
  throw new Error(result.error || '技能执行失败')
}
