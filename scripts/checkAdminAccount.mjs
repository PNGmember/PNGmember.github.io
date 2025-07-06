// 检查管理员账户信息
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

async function checkAdminAccount() {
  try {
    console.log('检查管理员账户信息...')
    
    // 查询admin用户
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('username', 'admin')
    const adminUser = await userQuery.first()
    
    if (adminUser) {
      console.log('\n找到admin账户:')
      console.log(`  ID: ${adminUser.id}`)
      console.log(`  用户名: ${adminUser.get('username')}`)
      console.log(`  昵称: ${adminUser.get('nickname')}`)
      console.log(`  角色: ${adminUser.get('role')}`)
      console.log(`  公会: ${adminUser.get('guild')}`)
      console.log(`  邮箱: ${adminUser.get('email')}`)
      console.log(`  状态: ${adminUser.get('isActive')}`)
      console.log(`  权限: ${JSON.stringify(adminUser.get('permissions'))}`)
      
      // 如果guild字段为空，更新它
      if (!adminUser.get('guild')) {
        console.log('\n更新admin账户的guild字段...')
        adminUser.set('guild', 'purplenight')
        await adminUser.save()
        console.log('✅ guild字段已更新为 purplenight')
      }
      
      // 如果role不是管理员角色，更新它
      const currentRole = adminUser.get('role')
      if (!['admin', 'guild_admin', 'super_admin'].includes(currentRole)) {
        console.log('\n更新admin账户的role字段...')
        adminUser.set('role', 'guild_admin')
        await adminUser.save()
        console.log('✅ role字段已更新为 guild_admin')
      }
      
    } else {
      console.log('\n未找到admin账户，创建新的管理员账户...')
      
      const newAdmin = new AV.User()
      newAdmin.set('username', 'admin')
      newAdmin.set('password', 'admin123')
      newAdmin.set('email', 'admin@purplenight.com')
      newAdmin.set('nickname', '紫夜管理员')
      newAdmin.set('role', 'guild_admin')
      newAdmin.set('guild', 'purplenight')
      newAdmin.set('isActive', true)
      newAdmin.set('permissions', ['all'])
      
      await newAdmin.signUp()
      console.log('✅ 新管理员账户创建成功')
    }
    
    // 再次查询确认
    console.log('\n最终确认admin账户信息:')
    const finalQuery = new AV.Query(AV.User)
    finalQuery.equalTo('username', 'admin')
    const finalAdmin = await finalQuery.first()
    
    if (finalAdmin) {
      console.log(`  用户名: ${finalAdmin.get('username')}`)
      console.log(`  角色: ${finalAdmin.get('role')}`)
      console.log(`  公会: ${finalAdmin.get('guild')}`)
      console.log(`  状态: ${finalAdmin.get('isActive')}`)
    }
    
    console.log('\n检查完成！')
    
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkAdminAccount()
