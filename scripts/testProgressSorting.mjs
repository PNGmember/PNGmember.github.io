// 测试进度管理排序功能
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  masterKey: 'j9R1hchc7UY8YrxkwT02EwCG',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 使用MasterKey进行管理操作
AV.Cloud.useMasterKey()

// 模拟排序函数
function sortProgressData(data, sortField, sortDirection) {
  return [...data].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    // 特殊处理日期字段
    if (sortField === 'lastStudyDate') {
      // 将日期转换为时间戳，空值排在最后
      aValue = a.lastStudyDate ? new Date(a.lastStudyDate).getTime() : (sortDirection === 'asc' ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER)
      bValue = b.lastStudyDate ? new Date(b.lastStudyDate).getTime() : (sortDirection === 'asc' ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER)
    }
    
    // 特殊处理数字字段
    else if (sortField === 'progress' || sortField === 'courseOrder') {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    }
    
    // 字符串比较
    else if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    // 处理null/undefined值
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })
}

async function testProgressSorting() {
  try {
    console.log('测试进度管理排序功能...')
    
    // 获取所有进度数据
    console.log('\n1. 获取进度数据...')
    
    // 查询所有CourseProgress记录
    const progressQuery = new AV.Query('CourseProgress')
    const progressRecords = await progressQuery.find()
    
    console.log(`找到 ${progressRecords.length} 条进度记录`)
    
    // 获取用户信息
    const userIds = [...new Set(progressRecords.map(p => p.get('userId')))]
    const studentQuery = new AV.Query('Student')
    studentQuery.containedIn('id', userIds)
    const students = await studentQuery.find()
    
    // 创建用户ID到姓名的映射
    const userNameMap = new Map()
    students.forEach(student => {
      userNameMap.set(student.id, student.get('nickname') || student.get('name'))
    })
    
    // 转换数据格式
    const progressData = progressRecords.map(progress => ({
      id: progress.id,
      userId: progress.get('userId'),
      userName: userNameMap.get(progress.get('userId')) || '未知用户',
      courseName: progress.get('courseName'),
      courseCategory: progress.get('courseCategory'),
      courseOrder: progress.get('courseOrder') || 1,
      progress: progress.get('progress') || 0,
      status: progress.get('status'),
      lastStudyDate: progress.get('lastStudyDate')
    }))
    
    console.log('\n2. 测试各种排序...')
    
    // 测试排序字段
    const sortTests = [
      { field: 'userName', direction: 'asc', description: '按用户名升序' },
      { field: 'userName', direction: 'desc', description: '按用户名降序' },
      { field: 'courseName', direction: 'asc', description: '按课程名升序' },
      { field: 'courseCategory', direction: 'asc', description: '按课程类别升序' },
      { field: 'courseOrder', direction: 'asc', description: '按课程编号升序' },
      { field: 'progress', direction: 'desc', description: '按完成度降序' },
      { field: 'progress', direction: 'asc', description: '按完成度升序' },
      { field: 'status', direction: 'asc', description: '按状态升序' },
      { field: 'lastStudyDate', direction: 'desc', description: '按最后学习时间降序' },
      { field: 'lastStudyDate', direction: 'asc', description: '按最后学习时间升序' }
    ]
    
    for (const test of sortTests) {
      console.log(`\n${test.description}:`)
      const sorted = sortProgressData(progressData, test.field, test.direction)
      
      // 显示前5条记录
      sorted.slice(0, 5).forEach((item, index) => {
        let value = item[test.field]
        
        if (test.field === 'lastStudyDate') {
          value = value ? new Date(value).toLocaleDateString() : '无'
        } else if (test.field === 'progress') {
          value = `${value}%`
        } else if (test.field === 'courseOrder') {
          value = getCourseNumber(value)
        }
        
        console.log(`  ${index + 1}. ${item.userName} - ${item.courseName} - ${test.field}: ${value}`)
      })
      
      if (sorted.length > 5) {
        console.log(`  ... 还有 ${sorted.length - 5} 条记录`)
      }
    }
    
    console.log('\n3. 测试空值处理...')
    
    // 测试包含空值的数据
    const testDataWithNulls = [
      { userName: 'Alice', progress: 100, lastStudyDate: new Date('2024-01-15') },
      { userName: 'Bob', progress: 50, lastStudyDate: null },
      { userName: 'Charlie', progress: 0, lastStudyDate: new Date('2024-01-10') },
      { userName: 'David', progress: 75, lastStudyDate: undefined }
    ]
    
    console.log('\n按进度排序（包含空值）:')
    const sortedByProgress = sortProgressData(testDataWithNulls, 'progress', 'desc')
    sortedByProgress.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.userName}: ${item.progress}%`)
    })
    
    console.log('\n按最后学习时间排序（包含空值）:')
    const sortedByDate = sortProgressData(testDataWithNulls, 'lastStudyDate', 'desc')
    sortedByDate.forEach((item, index) => {
      const date = item.lastStudyDate ? new Date(item.lastStudyDate).toLocaleDateString() : '无'
      console.log(`  ${index + 1}. ${item.userName}: ${date}`)
    })
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 生成课程编号的辅助函数
function getCourseNumber(order) {
  if (order >= 1 && order <= 7) {
    return `1.${order}`
  } else if (order >= 8 && order <= 13) {
    return `2.${order - 7}`
  } else if (order >= 14 && order <= 18) {
    return `3.${order - 13}`
  } else if (order >= 19 && order <= 23) {
    return `4.${order - 18}`
  } else if (order >= 24 && order <= 29) {
    return `5.${order - 23}`
  }
  return order.toString()
}

testProgressSorting()
