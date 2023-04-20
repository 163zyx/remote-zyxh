<template>
  <el-container>
    <el-header></el-header>
    <el-main>
      <!-- 粒子特效 -->
      <vue-particles
        color="#fff"
        :particleOpacity="0.3"
        :particlesNumber="130"
        shapeType="circle"
        :particleSize="4"
        linesColor="#cc0000"
        :linesWidth="1"
        :lineLinked="true"
        :lineOpacity="0.3"
        :linesDistance="120"
        :moveSpeed="3"
        :hoverEffect="true"
        hoverMode="grab"
        :clickEffect="true"
        clickMode="push"
        class="particles"
      >
      </vue-particles>
      <el-form :model="loginInfo" :rules="rules" ref="loginInfo">
        <!-- logo -->
        <el-form-item>
          <img class="logo" src="../assets/image/yinan_login_logo.png" />
        </el-form-item>
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"
            v-model="loginInfo.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            placeholder="请输入密码"
            v-model="loginInfo.password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button round plain @click="btn_login">登录</el-button>
        </el-form-item>
      </el-form>
    </el-main>
    <el-footer></el-footer>
  </el-container>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      // local_token:"", //本地token
      userInfo: "",
      loginInfo: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 15, message: "长度在 3 到 15 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 5,
            max: 16,
            message: "长度在 5 到 16 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },

  // computed: {
  //   canSubmit() {
  //     const { username, password } = this.user;
  //     return Boolean(username && password);
  //   },
  // },

  watch: {
    $route: "",
  },

  //点击登录跳转页面
  methods: {
    //登陆
    btn_login() {
      //点击登陆按钮，请求登陆接口
      this.getLoginData();
      // if (window.localStorage.getItem) {
      // }
    },

    //请求登录接口
    getLoginData() {
      const params = {
        username: this.loginInfo.username,
        password: this.loginInfo.password,
      };
      return new Promise((resolve, reject) => {
        this.$axios
          .get(
            "http://119.3.221.188:8808/tfDbOperator-2.0/tfUsers/selectByUser",
            {
              params,
            }
          )
          .then((res) => {
            resolve(res.data);
            if (res.data == "") {
              this.$message.error("用户名密码错误，请重新输入");
            } else {
              this.$message.success("登陆成功");
              window.sessionStorage.setItem(
                "token",
                JSON.stringify(res.data.token)
              );
              window.sessionStorage.setItem("username", res.data.username);
              window.sessionStorage.setItem(
                "jurisdiction",
                res.data.jurisdiction
              );
              window.sessionStorage.setItem("serviceID", res.data.serviceid);

              console.log(
                "jurisdiction:",
                window.sessionStorage.getItem("jurisdiction")
              );
              if (res.data.jurisdiction === "superadmin") {
                this.$router.push("/screen");
              }else{
                this.$router.push('/home')
              }
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-container {
  width: 100%;
  height: 100vh;
  font-size: 14px;
  color: white;
  background-image: url("../assets/image/loginBg.jpg");
  background-size: 100% 100%;
  font-family: "Microsoft Yahei";
}

.el-form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/deep/ .el-input__inner {
  width: 350px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 0px solid #51f2fa;
  border-radius: 40px;
  color: white;
}
/deep/ .el-button {
  color: white;
  width: 350px;
  border: 1px solid #51f2fa;
  background-color: rgba(255, 255, 255, 0.05);
}

.logo {
  border: 0px;
  outline-width: 0px;
  vertical-align: top;
}

.particles {
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>

