import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SKILLS_BASE_PATH = path.join(__dirname, '..', 'skills')

export interface SkillResult {
  success: boolean
  result?: string
  error?: string
}

export async function executeSkill(skillName: string, parameters: Record<string, any> = {}): Promise<SkillResult> {
  return new Promise((resolve) => {
    const skillPath = path.join(SKILLS_BASE_PATH, skillName, 'main.py')
    
    console.log(`[SkillService] 执行技能: ${skillName}`)
    console.log(`[SkillService] 脚本路径: ${skillPath}`)
    console.log(`[SkillService] 参数:`, parameters)

    const inputStr = parameters.input || parameters.query || ''
    
    const python = spawn('python', [skillPath], {
      cwd: path.join(SKILLS_BASE_PATH, skillName),
      shell: true
    })

    let output = ''
    let errorOutput = ''

    python.stdout.on('data', (data) => {
      output += data.toString()
    })

    python.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    python.on('close', (code) => {
      console.log(`[SkillService] 技能 ${skillName} 执行完成, 退出码: ${code}`)
      
      if (code === 0 && output) {
        resolve({
          success: true,
          result: output.trim()
        })
      } else {
        resolve({
          success: false,
          error: errorOutput || `技能执行失败，退出码: ${code}`
        })
      }
    })

    python.on('error', (err) => {
      console.error(`[SkillService] 技能 ${skillName} 执行错误:`, err)
      resolve({
        success: false,
        error: err.message
      })
    })

    if (inputStr) {
      python.stdin.write(inputStr)
    }
    python.stdin.end()
  })
}

export async function callSkill(
  skillName: string,
  parameters: Record<string, any> = {}
): Promise<SkillResult> {
  try {
    return await executeSkill(skillName, parameters)
  } catch (error) {
    console.error(`[SkillService] 调用技能 ${skillName} 异常:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
