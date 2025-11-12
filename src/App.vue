<template>
  <div>
    <!-- ログイン状態に応じて表示を切り替える -->
    <header v-if="authStore.isAuthenticated" class="app-header">
      <!-- 面パンナビゲーション -->
      <div class="breadcrumb-container">
        <BreadCrumbNavigation :breadcrumbs="breadcrumbs" />
        <div class="date-container">
          <div class="date-text-container">
            <span class="current-date">{{ currentDate }}</span>
            <!-- <span class="center-name">｜{{ centerName }}</span> -->
          </div>
        </div>
      </div>

      <img src="@/assets/hokuohlog.png" alt="Hokuoh Logo" class="header-logo" />
      <!-- ユーザー名を動的に表示 -->
      <div class="user-area" @click="toggleDropdown">
        {{ authStore.userId }} ▼
        <div v-if="dropdownVisible" class="dropdown-menu">
          <button @click="logout">ログアウト</button>
        </div>
      </div>
    </header>
    <div v-if="authStore.isAuthenticated" class="main-container">
      <AppSidebar />
      <router-view class="view" />
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
  import AppSidebar from '@/components/menu/AppSidebar.vue';
  import { useAuthStore } from '@/stores/auth'; // ストアをインポート
  import { useRoute, useRouter } from 'vue-router'; // 現在のルートとルーターを取得
  import BreadCrumbNavigation from '@/components/menu/breadcrumb/BreadCrumbNavigation.vue';
  import { ref, computed, onMounted, onUnmounted } from 'vue';

  const route = useRoute(); // 現在のルート
  const router = useRouter(); // ルーターインスタンス
  const authStore = useAuthStore(); // ストアのインスタンス

  const breadcrumbs = computed(() => route.meta.breadcrumb || []);
  const dropdownVisible = ref(false); // ドロップダウンの表示状態

  // 日付を取得する
  const currentDate = computed(() => {
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return now.toLocaleDateString('ja-JP', options); // 日本語形式
  });

  // // センターコードとセンター名のマッピング
  // const centerMap = {
  //   '005': '岩槻センター',
  //   '001': '大宮センター',
  //   '003': '浮島センター',
  //   '004': '厚木センター',
  // };

  // // 現在のセンター名を計算
  // const centerName = computed(() => {
  //   return centerMap[authStore.centerId] || '不明なセンター';
  // });

  // ドロップダウンの表示/非表示を切り替える関数
  const toggleDropdown = () => {
    dropdownVisible.value = !dropdownVisible.value;
  };

  // ドロップダウンを非表示にする関数
  const closeDropdown = () => {
    dropdownVisible.value = false;
  };

  // グローバルクリックイベントを登録
  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
  });

  // グローバルクリックイベントを解除
  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
  // ドロップダウン外をクリックした場合に非表示にする関数
  const handleOutsideClick = (event) => {
    const dropdown = document.querySelector('.user-area'); // ドロップダウンの親要素
    if (dropdown && !dropdown.contains(event.target)) {
      closeDropdown();
    }
  };
  // ログアウト処理
  const logout = () => {
    authStore.logout(); // 認証状態をリセット
    router.push('/login'); // ログイン画面に遷移
  };
</script>

<style scoped>
  .dashboard {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  /* ヘッダー全体のスタイル */
  .app-header {
    display: flex;
    align-items: center;
    background: linear-gradient(90deg, #33b48d, #40a7f6); /* 左から右へのグラデーション */
    color: #f7fafa; /* テキストの色 */
    padding: 0 20px;
    position: relative;
    height: 60px; /* ヘッダーの高さ */
  }

  /* ロゴ画像のスタイル */
  .header-logo {
    height: 40px; /* ロゴの高さを調整 */
    margin-right: 10px; /* タイトルとの間隔を調整 */
  }

  /* 面パンナビゲーション */
  .breadcrumb-container {
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px; /* アイコンや日付との間隔を調整 */
  }

  /* ユーザーエリア */
  .user-area {
    margin-left: auto;
    position: relative;
    cursor: pointer;
  }

  /* メインコンテンツエリア */
  .main-container {
    display: flex;
    flex: 1;
  }

  .view {
    width: 100%;
    max-width: 1900px;
    border: 1px solid #ebebeb;
    margin: 20px;
    padding: 20px;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%; /* 親要素の下に配置 */
    right: 0; /* 右端に配置 */
    display: flex; /* 横方向に配置 */
    flex-direction: row; /* 横並びを明示 */
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 5px 10px;
    z-index: 1000;
  }

  .dropdown-menu button {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 5px 10px; /* ボタンの間隔 */
    text-align: center;
    white-space: nowrap; /* ボタン内のテキストを1行で表示 */
  }

  .dropdown-menu button:hover {
    background: #f0f0f0;
  }

  /* カレンダーアイコンと日付のスタイル */
  .date-container {
    display: flex; /* アイコンとテキストを横並びに */
    align-items: center; /* 垂直方向の中央揃え */
    gap: 5px; /* アイコンとテキストの間隔を調整 */
    color: #fff; /* テキストとアイコンの色 */
  }

  /* 日付テキストのスタイル */
  .current-date {
    font-size: 20px; /* 日付テキストのサイズ */
    font-weight: normal; /* 必要に応じてスタイル変更 */
    color: #fff; /* 日付テキストの色 */
  }

  /* 日付テキストのスタイル */
  .date-text-container {
    display: flex;
    align-items: center;
  }
</style>
