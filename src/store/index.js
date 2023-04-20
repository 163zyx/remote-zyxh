import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'


Vue.use(Vuex)

export default new Vuex.Store({
  state: { // 要设置的全局方位的state对象
    //要设置的初始属性值
    ServiceListRes: null,
  },

  mutations: { // 可以理解为store里的methods

    updateServiceDate(state, data) {

      state.ServiceListRes = data
      console.log(data);
    },

    /**
        * 根据服务主体名获取ID
        */
    getServiceIdByName(servicename) {
      var serviceId;
      //遍历查询服务主体名称
      for (var j = 0; j < this.ServiceListRes.length; j++) {
        if (this.ServiceListRes[j].servicename == servicename) {
          serviceId = this.ServiceListRes[j].serviceid;
          break;
        }
      }
      return serviceId;
    },

    /**
     * 根据服务主体ID获取名称
     */
    getServiceNameByID(serviceid) {
      var servicename;
      //遍历查询服务主体名称
      for (var j = 0; j < this.ServiceListRes.length; j++) {
        if (this.ServiceListRes[j].serviceid == serviceid) {
          servicename = this.ServiceListRes[j].servicename;
          break;
        }
      }
      return servicename;
    },

  },
  actions: {
    queryServiceList() {

    },

    increment(context) {
      Axios
        .get("tfServicesubject/selectAllServiceSub?offset=0&limit=10000000")
        .then((res) => {
          context.commit('updateServiceDate', res.data);

        })
        .catch((err) => {
          console.log(err);
        });

    }


  },
  modules: {
  }
})
