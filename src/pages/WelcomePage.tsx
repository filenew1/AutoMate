import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Bot, Sparkles, MessageCircle, Lightbulb } from 'lucide-react'

export const WelcomePage: React.FC = () => {
  const { agents, theme } = useAppStore()
  
  const totalAgents = agents.reduce((sum, group) => sum + group.agents.length, 0)
  const totalSkills = agents.reduce((sum, group) => {
    return sum + group.agents.reduce((skillSum, agent) => skillSum + agent.skills.length, 0)
  }, 0)

  const isDark = theme === 'dark'

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-4xl w-full">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
          <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Bot className="w-14 h-14 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          欢迎使用 AutoMate
        </h1>
        
        <p className={`text-base mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          选择左侧的智能体开始对话，体验智能化的任务处理
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`p-5 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100'}`}>
            <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div id="total-agents" className="text-2xl font-bold mb-1 text-blue-600">
              {String(totalAgents)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              可用智能体
            </div>
          </div>

          <div className={`p-5 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-100'}`}>
            <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div id="total-skills" className="text-2xl font-bold mb-1 text-green-600">
              {String(totalSkills)}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              可用技能
            </div>
          </div>

          <div className={`p-5 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-100'}`}>
            <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div id="total-chats" className="text-2xl font-bold mb-1 text-purple-600">
              0
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              对话次数
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl ${isDark ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'}`}>
          <div className="flex items-center justify-center gap-2 mb-5">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>快速开始</h3>
          </div>
          
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                1
              </div>
              <span className={`text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                从左侧列表选择一个智能体
              </span>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                2
              </div>
              <span className={`text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                在输入框中输入您的问题
              </span>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                3
              </div>
              <span className={`text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                按 Enter 发送消息开始对话
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
