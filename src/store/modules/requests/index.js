export default {
  namespaced: true, // name spaced is used to make sure getters in other modules can't have the same names as here
  //here we a basically making an extra store that only handles the code specific to our counters
  //it's also important to note that unlike mutations, actions and getters, state is not global
  // so the counter module does not know whats in the stae of the Auth module
  state() {
    return {
      requests: [],
    };
  },
  mutations: {
    addRequest(state, payload) {
      state.requests.push(payload);
    },
    setRequests(state, payload) {
      state.requests = payload;
    },
  },
  actions: {
    async contactCoach(context, payload) {
      const newRequest = {
        userEmail: payload.email,
        message: payload.message,
      };
      const response = await fetch(
        `https://backend-e5f89-default-rtdb.firebaseio.com/requests/${payload.coachId}.json`,
        {
          method: 'POST',
          body: JSON.stringify(newRequest),
        }
      );
      const responseData = await response.json();

      if (!response.ok) {
        const error = new Error(
          responseData.message || 'failed to send request!'
        );
        throw error;
      }
      newRequest.id = responseData.name;
      newRequest.coachId = payload.coachId;
      context.commit('addRequest', newRequest);
    },

    async fetchRequests(context) {
      const coachId = context.rootGetters.userId;
      const token = context.rootGetters.token;
      const response = await fetch(
        `https://backend-e5f89-default-rtdb.firebaseio.com/requests/${coachId}.json?auth=${token}`
      );
      const responseData = await response.json();

      if (!response.ok) {
        const error = new Error(
          responseData.message || 'failed to fetch request!'
        );
        throw error;
      }

      const requests = [];
      for (const key in responseData) {
        const request = {
          id: key,
          coachId: coachId,
          userEmail: responseData[key].userEmail,
          message: responseData[key].message,
        };
        requests.push(request);
      }

      context.commit('setRequests', requests);
    },
  },

  getters: {
    requests(state, _, _2, rootGetters) {
      const coachId = rootGetters.userId;
      return state.requests.filter((req) => req.coachId === coachId);
    },
    hasRequests(_, getters) {
      return getters.requests && getters.requests.length > 0;
    },
  },
};
