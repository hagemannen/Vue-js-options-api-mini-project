import { createRouter, createWebHistory } from 'vue-router';
import CoachDetail from './pages/coaches/CoachDetail.vue';
import CoachList from './pages/coaches/CoachList.vue';
import CoachRegister from './pages/coaches/CoachRegister.vue';
import ContactCoaches from './pages/request/ContactCoaches.vue';
import RequestReceived from './pages/request/RequestReceived.vue';
import UserAuth from './pages/auth/UserAuth.vue';
import NotFound from './pages/NotFound.vue';
import store from './store/index.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/coaches',
      component: CoachList,
    },
    {
      path: '/coaches',
      component: CoachList,
    },
    {
      path: '/coaches/:id',
      component: CoachDetail,
      props: true, //this means that it takes the prop id as it's file name so :id will become f.eks c1
      children: [
        {
          path: 'contact',
          component: ContactCoaches,
        },
      ],
    },
    {
      path: '/register',
      component: CoachRegister,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/request',
      component: RequestReceived,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/auth',
      component: UserAuth,
      meta: {
        requiresUnauth: true,
      },
    },
    { path: '/:notFound(.*)', component: NotFound },
  ],
});

router.beforeEach(function (to, _, next) {
  // underscore just raplaces from since we're not using it. but it is required
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    // this part is used for if a user tries to access a page they shoulding using URL. they will then be send to the login page instead
    next('/auth');
  } else if (to.meta.requiresUnauth && store.getters.isAuthenticated) {
    next('/coaches');
  } else {
    next(); // this is just the else case. so if the user is allowed on the page they are trying to access the will be allowed
  }
});

export default router;
