import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const SKILLS_BASE_PATH = path.join(__dirname, '..', 'skills')

function executeSkill(skillName, parameters = {}) {
  return new Promise((resolve) => {
    const skillPath = path.join(SKILLS_BASE_PATH, skillName, 'main.py')
    
    console.log(`[SkillService] 执行技能: ${skillName}`)
    console.log(`[SkillService] 脚本路径: ${skillPath}`)
    console.log(`[SkillService] 参数:`, parameters)

    const args = [skillPath]
    if (parameters && Object.keys(parameters).length > 0) {
      args.push('--params', JSON.stringify(parameters))
    }

    const python = spawn('python', args, {
      cwd: path.join(SKILLS_BASE_PATH, skillName),
      shell: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    })

    let output = ''
    let errorOutput = ''

    python.stdout.on('data', (data) => {
      output += data.toString('utf-8')
    })

    python.stderr.on('data', (data) => {
      errorOutput += data.toString('utf-8')
    })

    python.on('close', (code) => {
      console.log(`[SkillService] 技能 ${skillName} 执行完成, 退出码: ${code}`)
      console.log(`[SkillService] 输出: ${output}`)
      
      if (code === 0 && output) {
        resolve({
          success: true,
          result: output.trim()
        })
      } else if (code === 0) {
        resolve({
          success: true,
          result: '技能执行完成（无输出）'
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
  })
}

app.post('/api/skills/call', async (req, res) => {
  console.log('[Backend] 收到技能调用请求:', req.body)
  
  const { skill_name, parameters } = req.body
  
  if (!skill_name) {
    return res.status(400).json({ 
      success: false, 
      error: '缺少 skill_name 参数' 
    })
  }

  try {
    const result = await executeSkill(skill_name, parameters || {})
    console.log('[Backend] 技能执行结果:', result)
    res.json(result)
  } catch (error) {
    console.error('[Backend] 技能执行异常:', error)
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    })
  }
})

app.get('/api/skills', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Skill API 服务运行中'
  })
})

app.listen(PORT, () => {
  console.log(`[Backend] 技能服务已启动: http://localhost:${PORT}`)
  console.log(`[Backend] 技能目录: ${SKILLS_BASE_PATH}`)
})
