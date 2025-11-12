<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <img src="@/assets/ryutsu.png" alt="Logo" class="logo" />
        <h2>
          ようこそ
          <br />
          for Hokuoh
        </h2>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div class="input-group">
          <i class="icon user-icon"></i>
          <input type="text" id="username" v-model="username" placeholder="ユーザーID" required />
        </div>

        <div class="input-group">
          <i class="icon lock-icon"></i>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="パスワード"
            required
          />
        </div>

        <button type="submit" class="login-button">ログイン</button>

        <!-- ❗エラーメッセージ表示 -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <footer>
        <p>Produced by 北王流通株式会社</p>
        <small>
          ※ログインパスワードをお忘れの方は
          <a href="#">こちら</a>
          よりお問い合わせください。
        </small>
      </footer>
    </div>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import axios from 'axios';
  import { useAuthStore } from '@/stores/auth';

  const router = useRouter();
  const username = ref('');
  const password = ref('');
  const errorMessage = ref('');

  // ✅ API定義
  const API_BASE = process.env.VUE_APP_API_BASE_URL;
  const API_USERS = `${API_BASE}/users`;

  const login = async () => {
    errorMessage.value = ''; // メッセージ初期化

    try {
      const authStore = useAuthStore();
      const response = await axios.post(`${API_USERS}/login`, {
        userId: username.value,
        password: password.value,
      });

      if (response.data.status === 'success') {
        // ✅ 認証情報を保存
        authStore.userId = response.data.user.userId;
        authStore.userName = response.data.user.name;
        authStore.role = response.data.user.role;
        authStore.login();

        // ✅ 成功時はアラートなしで画面遷移
        router.push('/itemcategories');
      } else {
        // ✅ パスワード不一致など
        errorMessage.value = response.data.message || 'ユーザーIDまたはパスワードが間違っています';
      }
    } catch (error) {
      console.error('ログイン中にエラーが発生しました:', error);
      errorMessage.value = 'サーバーに接続できませんでした';
    }
  };
</script>

<style scoped>
  .login-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #29c0a4 0%, #40a7f6 40%, #851e8f 70%, #ff7eb3 100%);
    padding-left: 10vw;
  }
  .login-box {
    background: #fff;
    padding: 70px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 100%;
    text-align: center;
  }
  .logo-section {
    margin-bottom: 30px;
  }
  .logo {
    width: 120px;
    height: auto;
    margin-bottom: 10px;
  }
  h2 {
    font-size: 1.4rem;
    color: #4a4a4a;
    font-weight: 600;
  }
  .input-group {
    position: relative;
    margin-bottom: 20px;
    width: 345px;
  }
  .icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 18px;
  }
  input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }
  input:focus {
    border-color: #33b48d;
    outline: none;
    background: #fff;
  }
  .login-button {
    width: 100%;
    padding: 12px;
    background-color: #5a40f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 600;
  }
  .login-button:hover {
    background-color: #4535d1;
  }

  /* ✅ エラーメッセージ */
  .error-message {
    color: #d9534f;
    margin-top: 10px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  footer {
    margin-top: 20px;
  }
  footer p,
  footer small {
    color: #aaa;
    font-size: 0.8rem;
  }
  footer a {
    color: #5a40f6;
    text-decoration: none;
  }
  footer a:hover {
    text-decoration: underline;
  }
  .user-icon::before {
    content: '👤';
  }
  .lock-icon::before {
    content: '🔒';
  }
</style>
