import Vue from "vue";
// import { login, getInfo, logout } from '@/api/login'
import { login, logout } from "@/api/login";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ID } from "@/store/mutation-types";
import { welcome } from "@/utils/util";
import jwt from "jsonwebtoken";

const user = {
  state: {
    token: "",
    refreshToken: "",
    name: "",
    welcome: "",
    avatar: "",
    roles: [],
    info: {},
    userId: ""
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_REFRESH_TOKEN: (state, token) => {
      state.refreshToken = token;
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name;
      state.welcome = welcome;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_INFO: (state, info) => {
      state.info = info;
    },
    SET_USER_ID: (state, id) => {
      state.userId = id;
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then(response => {
            const result = response.data;
            Vue.ls.set(
              ACCESS_TOKEN,
              result.access_token,
              7 * 24 * 60 * 60 * 1000
            );
            Vue.ls.set(
              REFRESH_TOKEN,
              result.refresh_token,
              7 * 24 * 60 * 60 * 1000
            );
            Vue.ls.set(USER_ID, result.userId, 7 * 24 * 60 * 60 * 1000);
            commit("SET_TOKEN", result.access_token);
            commit("SET_REFRESH_TOKEN", result.refresh_token);
            commit("SET_USER_ID", result.userId);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        const token = Vue.ls.get(ACCESS_TOKEN);
        const result = jwt.decode(token);
        result.role = {
          id: "admin",
          name: "管理员",
          permissionList: [
            "simApplication",
            "dashboard",
            "exception",
            "result",
            "profile",
            "table",
            "form",
            "order",
            "permission",
            "role",
            "table",
            "user",
            "support"
          ]
        };
        commit("SET_NAME", { name: result.username, welcome: welcome() });
        commit("SET_ROLES", result.role);
        resolve(result);
      });
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise(resolve => {
        commit("SET_TOKEN", "");
        commit("SET_ROLES", []);
        Vue.ls.remove(ACCESS_TOKEN);

        logout(state.token)
          .then(() => {
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    }
  }
};

export default user;
