<template>
  <div class="qr-container">
    <h1 class="title">QRコード印刷プレビュー</h1>

    <!-- ✅ QRコードのみ -->
    <div class="qr-print-area">
      <div v-for="(device, index) in devices" :key="device.deviceId" class="qr-page">
        <div class="qr-item">
          <qrcode-vue :value="device.deviceId" :size="300" />
        </div>

        <!-- ✅ ページ区切り（1枚ずつ印刷） -->
        <div v-if="index !== devices.length - 1" class="page-break"></div>
      </div>
    </div>

    <!-- ✅ 通常表示時のみ見えるボタン -->
    <div class="buttons">
      <el-button @click="goBack">戻る</el-button>
      <el-button type="primary" @click="printPage">印刷する</el-button>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import QrcodeVue from 'qrcode.vue';
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  const router = useRouter();
  const devices = ref([]);

  onMounted(() => {
    if (route.query.data) {
      try {
        devices.value = JSON.parse(decodeURIComponent(route.query.data));
      } catch {
        devices.value = [];
      }
    }
  });

  const goBack = () => router.push('/drvice_management');
  const printPage = () => window.print();
</script>

<style scoped>
  .qr-container {
    padding: 30px;
    background: white;
    min-height: 100vh;
  }

  .qr-item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh; /* ✅ ページ中央に配置 */
  }

  .title {
    text-align: center;
    margin-bottom: 20px;
  }

  /* ✅ 印刷専用スタイル */
  @media print {
    /* 印刷時は余白削除 */
    body,
    html {
      margin: 0;
      padding: 0;
      background: white;
    }

    /* ✅ タイトル・ボタン類を非表示 */
    .title,
    .buttons {
      display: none !important;
    }

    /* ✅ 1ページに1つのQRだけ印刷 */
    .qr-page {
      page-break-after: always;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    /* ✅ QR以外の装飾も消す */
    .qr-container {
      padding: 0;
    }
  }

  /* ✅ 通常時のボタン配置 */
  .buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
  }

  .page-break {
    page-break-after: always;
  }
</style>
