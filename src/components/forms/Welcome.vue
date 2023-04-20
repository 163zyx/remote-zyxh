<template>
  <div>
    <el-card style="height: 40vh; width: 87vw">
      <h4>亲爱的【{{ jurisdiction[sessionstorage_userInfo.authority]}}】,后台管理系统欢迎您！</h4>
    </el-card>
  </div>
</template>


<script>
export default {
  data() {
    return {
      jurisdiction: {  //权限分类
        enterpriseadmin: '企业用户',
        superadmin: '超级管理员',
      },
      sessionstorage_userInfo: {  //session存储用户
        username: window.sessionStorage.getItem('username'), //用户名
        authority: window.sessionStorage.getItem('jurisdiction'), //权限
      },
    }
  },
  methods: {},
}
</script>