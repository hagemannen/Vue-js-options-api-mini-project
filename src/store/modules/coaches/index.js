export default {
  namespaced: true, // name spaced is used to make sure getters in other modules can't have the same names as here
  //here we a basically making an extra store that only handles the code specific to our counters
  //it's also important to note that unlike mutations, actions and getters, state is not global
  // so the counter module does not know whats in the stae of the Auth module
  state() {
    return {
      lastFetch: null,
      coaches: [
        {
          id: 'c1',
          firstName: 'Maximilian',
          lastName: 'Schwarzmüller',
          areas: ['frontend', 'backend', 'career'],
          description:
            "I'm Maximilian and I've worked as a freelance web developer for years. Let me help you become a developer as well!",
          hourlyRate: 30,
        },
        {
          id: 'c2',
          firstName: 'Julie',
          lastName: 'Jones',
          areas: ['frontend', 'career'],
          description:
            'I am Julie and as a senior developer in a big tech company, I can help you get your first job or progress in your current role.',
          hourlyRate: 30,
        },
      ],
    };
  },
  mutations: {
    registerCoach(state, payload) {
      state.coaches.push(payload);
    },
    setCoaches(state, payload) {
      state.coaches = payload;
    },
    setFetchTimestamp(state) {
      state.lastFetch = new Date().getTime();
    },
  },
  actions: {
    async registerCoach(context, data) {
      const userId = context.rootGetters.userId;
      const coachData = {
        firstName: data.first,
        lastName: data.last,
        description: data.desc,
        hourlyRate: data.rate,
        areas: data.areas,
      };
      const token = context.rootGetters.token;
      const response = await fetch(
        `https://backend-e5f89-default-rtdb.firebaseio.com/coaches/${userId}.json?auth=` +
          token, // the ?auth= part of this line means the this is only available if the user making the request is logged in
        {
          method: 'PUT',
          body: JSON.stringify(coachData),
        }
      );
      const responseData = await response.json();
      if (!response.ok) {
        const error = new Error(
          responseData.message || 'failed to fetch data!'
        );
        throw error;
      }
      context.commit('registerCoach', { ...coachData, id: userId });
    },
    async loadCoaches(context, payload) {
      if (!payload.forceRefrech && !context.getters.shouldUpdate) {
        return;
      }
      const response = await fetch(
        'https://backend-e5f89-default-rtdb.firebaseio.com/coaches.json'
      );
      const responseData = await response.json();
      if (!response.ok) {
        //error
      }
      const coaches = [];
      for (const key in responseData) {
        const coach = {
          id: key,
          firstName: responseData[key].firstName,
          lastName: responseData[key].lastName,
          description: responseData[key].description,
          hourlyRate: responseData[key].hourlyRate,
          areas: responseData[key].areas,
        };
        coaches.push(coach);
      }

      context.commit('setCoaches', coaches);
      context.commit('setFetchTimestamp');
    },
  },
  getters: {
    coaches(state) {
      return state.coaches;
    },
    hasCoaches(state) {
      return state.coaches && state.coaches.length > 0;
    },
    isCoach(_state, getters, _2, rootGetters) {
      const coaches = getters.coaches;
      const userId = rootGetters.userId;
      return coaches.some((coach) => coach.id === userId);
    },
    shouldUpdate(state) {
      const lastFetch = state.lastFetch;
      if (!lastFetch) {
        return true;
      }
      const currentTimestamp = new Date().getTime();
      return (currentTimestamp - lastFetch) / 1000 > 60;
    },
  },
};
