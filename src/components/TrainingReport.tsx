import React from 'react'
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react'

export default function TrainingReport() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">新训考核报告</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">查看你的培训考核报告和成绩分析</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-600 dark:to-orange-700 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <Clock className="w-8 h-8 mr-4" />
          <div>
            <h2 className="text-xl font-bold mb-2">功能开发中</h2>
            <p className="text-yellow-100">
              新训考核报告功能正在紧张开发中，敬请期待！
            </p>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Features */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-purple-night-600 dark:text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">即将推出的功能</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-night-600 dark:bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">个人考核报告</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">详细的个人培训考核成绩和分析</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-night-600 dark:bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">成绩趋势分析</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">学习成绩的时间趋势和进步轨迹</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-night-600 dark:bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">技能评估</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">各项技能的掌握程度评估</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-night-600 dark:bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">改进建议</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">基于表现的个性化学习建议</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Report Preview */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">报告预览</h3>
          </div>
          
          <div className="space-y-4">
            {/* Mock Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">85%</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">综合评分</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-900 dark:text-green-100">12</div>
                <div className="text-xs text-green-600 dark:text-green-400">完成课程</div>
              </div>
            </div>

            {/* Mock Chart Placeholder */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">成绩趋势图表</p>
            </div>

            {/* Mock Skills */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">理论知识</span>
                <span className="text-sm font-medium dark:text-white">90%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 dark:bg-green-400 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">实践操作</span>
                <span className="text-sm font-medium dark:text-white">75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">团队协作</span>
                <span className="text-sm font-medium dark:text-white">88%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Status */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">开发进度</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              我们正在努力开发新训考核报告功能，预计将在下个版本中发布。
              该功能将为每位学员提供详细的培训考核分析，帮助大家更好地了解自己的学习状况。
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">预计功能包括：</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• 个人考核成绩详情</li>
                <li>• 各科目成绩分析</li>
                <li>• 学习进度跟踪</li>
                <li>• 技能掌握评估</li>
                <li>• 个性化改进建议</li>
                <li>• 历史成绩对比</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
