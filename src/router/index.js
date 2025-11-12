import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/login', // デフォルトはログインページへリダイレクト
    meta: { breadcrumb: [{ label: 'ホーム', path: '/' }] },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/login/LoginView.vue'),
    meta: { breadcrumb: [{ label: 'ログイン', path: '/login' }] },
  },
  {
    path: '/companies',
    name: 'CompanyMaster',
    component: () => import('../components/menu/assetmanagement/CompanyMaster.vue'),
    meta: {
      breadcrumb: [
        { label: 'ホーム', path: '/' },
        { label: '資産会社', path: '/companies' },
      ],
    },
  },
  {
    path: '/itemcategories',
    name: 'ItemCategories',
    component: () => import('../components/menu/assetmanagement/ItemCategories.vue'),
    meta: {
      breadcrumb: [
        { label: 'ホーム', path: '/' },
        { label: 'カテゴリー', path: '/itemcategories' },
      ],
    },
  },
  {
    path: '/loan_management',
    name: 'LoanManagement',
    component: () => import('../components/menu/assetmanagement/LoanManagement.vue'),
    meta: {
      breadcrumb: [
        { label: 'ホーム', path: '/' },
        { label: '貸出履歴', path: '/loan_management' },
      ],
    },
  },
  {
    path: '/loan_state',
    name: 'LoanStatus',
    component: () => import('../components/menu/assetmanagement/LoanStatus.vue'),
    meta: {
      breadcrumb: [
        { label: 'ホーム', path: '/' },
        { label: '貸出状況', path: '/loan_state' },
      ],
    },
  },
  {
    path: '/office_master',
    name: 'OfficeMaster',
    component: () => import('../components/menu/assetmanagement/OfficeMaster.vue'),
    meta: {
      breadcrumb: [
        { label: 'ホーム', path: '/' },
        { label: '営業所', path: '/office_master' },
      ],
    },
  },

  {
    path: '/drvice_management',
    name: 'DeviceManagement',
    component: () => import('../components/menu/assetmanagement/DeviceManagement.vue'),
    meta: {
      breadcrumb: [
        { label: 'ホーム', path: '/' },
        { label: '端末台帳', path: '/drvice_management' },
      ],
    },
  },

  {
    path: '/qr_preview',
    name: 'QrPreview',
    component: () => import('../components/menu/assetmanagement/QrPreview.vue'),
    meta: {
      breadcrumb: [
        { label: 'ホーム', path: '/' },
        { label: 'QR印刷プレビュー', path: '/qr_preview' },
      ],
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// グローバルナビゲーションガード
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // ログインページへのアクセスは常に許可
  if (to.path !== '/login' && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }

  // ログインしていない場合はログインページへリダイレクト
  if (!authStore.isAuthenticated) {
    next('/login');
  } else {
    next(); // ログイン済みの場合はそのまま進む
  }
});

export default router;
