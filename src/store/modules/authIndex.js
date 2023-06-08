let timer;

export default {
  state() {
    return {
      userId: null,
      token: null,
      didAutoLogout: false,
    };
  },
  mutations: {
    setUser(state, payload) {
      state.token = payload.token;
      state.userId = payload.userId;
      state.didAutoLogout = false;
    },
    setAutoLogout(state) {
      state.didAutoLogout = true;
    },
  },
  actions: {
    async login(context, payload) {
      return context.dispatch('auth', {
        ...payload,
        mode: 'login',
      });
    },

    async signup(context, payload) {
      return context.dispatch('auth', {
        ...payload,
        mode: 'signup',
      });
    },

    async auth(context, payload) {
      const mode = payload.mode;
      let url =
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDoSOxUJJOiHLUebeU_m8SBMhG0DCJZlLA';

      if (mode === 'signup') {
        url =
          'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDoSOxUJJOiHLUebeU_m8SBMhG0DCJZlLA';
      }

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          returnSecureToken: true,
        }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        console.log(responseData);
        const error = new Error(
          responseData.message ||
            'failed to Authenticate! Check your login ' +
              '(' +
              responseData.error.code +
              ' ' +
              responseData.error.message +
              ')'
        );
        throw error;
      }

      const expiresIn = +responseData.expiresIn * 1000;
      //const tokenExpiresIn = 6000;
      const tokenExpirationDate = new Date().getTime() + expiresIn;

      localStorage.setItem('token', responseData.idToken);
      localStorage.setItem('userId', responseData.localId);
      localStorage.setItem('tokenExpiration', tokenExpirationDate);

      timer = setTimeout(function () {
        context.dispatch('autoLogout');
      }, expiresIn); // this makes sure that the user is logged out when their token has expired

      context.commit('setUser', {
        token: responseData.idToken,
        userId: responseData.localId,
      });
    },

    autoLogin(context) {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const tokenExpiration = localStorage.getItem('tokenExpiration');

      const tokenExpiresIn = +tokenExpiration - new Date().getTime();

      //this check to see if there is less than a minute until the users token is expired and then blocks them from auto logging in
      if (tokenExpiresIn < 0) {
        return; //returns means the rest of this funktion wont be exicuted so the user will not be logged in
      }

      timer = setTimeout(function () {
        context.dispatch('autoLogout');
      }, tokenExpiresIn);

      if (token && userId) {
        context.commit('setUser', {
          token: token,
          userId: userId,
        });
      }
    },

    logout(context) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('tokenExpiration');

      clearTimeout(timer);

      context.commit('setUser', {
        token: null,
        userId: null,
      });
    },
    autoLogout(context) {
      context.dispatch('logout');
      context.commit('setAutoLogout');
    },
  },
  getters: {
    userId(state) {
      return state.userId;
    },
    token(state) {
      return state.token;
    },
    isAuthenticated(state) {
      return !!state.token; //the double ! means that this is now a boolean and it is true
    },
    didAutoLogout(state) {
      return state.didAutoLogout;
    },
  },
};
