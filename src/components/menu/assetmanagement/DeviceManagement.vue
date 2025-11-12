<template>
  <div class="container">
    <!-- ✅ タイトル -->
    <div class="header">
      <h1>端末管理台帳一覧</h1>
    </div>

    <!-- ✅ ボタン群 -->
    <div class="action-buttons">
      <button class="action-button import-button">
        <i class="icon fas fa-file-import"></i>
        インポート
      </button>
      <button class="action-button export-button">
        <i class="icon fas fa-file-export"></i>
        エクスポート
      </button>
      <button class="action-button qr-button" @click="printQR">
        <i class="icon fas fa-qrcode"></i>
        QR印刷
      </button>
      <button class="action-button current-category-button" @click="openForm">
        <i class="icon fas fa-laptop"></i>
        資産登録
      </button>
    </div>

    <!-- ✅ テーブル横スクロール対応 -->
    <div class="table-wrapper">
      <el-table
        ref="multipleTableRef"
        :data="paginatedData"
        style="min-width: 1400px"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="端末ID" prop="deviceId" width="240" />
        <el-table-column label="ステータス" width="120">
          <template #default="scope">
            <span
              :style="{
                color:
                  scope.row.deviceStatus === '使用可'
                    ? '#43a047' // 緑
                    : scope.row.deviceStatus === '貸出中'
                    ? '#fb8c00' // オレンジ（追加）
                    : '#e53935', // 赤
                fontWeight: 'bold',
              }"
            >
              {{ scope.row.deviceStatus }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="品目名" prop="itemName" width="180" />
        <el-table-column label="所有会社" prop="assetCompany" width="180" />
        <el-table-column label="メーカー" prop="manufacturer" width="160" />
        <el-table-column label="型番" prop="model" width="160" />
        <el-table-column label="製造番号" prop="serialNumber" width="180" />
        <el-table-column label="契約形態" prop="contractType" width="140" />
        <el-table-column label="資産管理番号" prop="assetnumber" width="140" />

        <!-- ✅ 追加: 契約年数（リース年数） -->
        <el-table-column label="契約年数" prop="contractYears" width="120">
          <template #default="scope">
            {{ scope.row.contractYears ? scope.row.contractYears + '年' : '-' }}
          </template>
        </el-table-column>

        <!-- ✅ 追加: ライセンス番号 -->
        <el-table-column label="ライセンス番号" prop="licenseNo" width="180" />

        <!-- ✅ 追加: ライセンス番号 -->
        <el-table-column label="セキュリティソフト" prop="security" width="180" />

        <el-table-column label="登録日" prop="registrationDate" width="160" />
        <el-table-column label="スペック詳細" prop="spec" width="220" show-overflow-tooltip />
        <el-table-column label="備考" prop="remarks" show-overflow-tooltip />

        <!-- ✅ 操作ボタン -->
        <el-table-column align="right" width="200">
          <template #header>
            <el-input v-model="search" size="small" placeholder="キーワード検索" clearable />
          </template>
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">編集</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">削除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ✅ ページネーション -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="filterTableData.length"
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        :page-sizes="[10, 20, 30, 40, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- ✅ モーダル：端末登録フォーム -->
    <transition name="fade">
      <div v-if="showForm" class="modal-overlay">
        <div class="modal-card">
          <h2>新規資産登録</h2>

          <div class="form-scroll">
            <!-- 品目 -->
            <div class="form-group">
              <label>
                品目名
                <span class="required">*</span>
              </label>
              <el-select
                v-model="form.itemName"
                placeholder="品目を選択してください"
                filterable
                clearable
                @change="onItemSelect"
              >
                <el-option
                  v-for="i in itemList"
                  :key="i.itemId"
                  :label="i.itemName"
                  :value="i.itemName"
                />
              </el-select>
            </div>

            <!-- 所有会社 -->
            <div class="form-group">
              <label>
                資産所有会社
                <span class="required">*</span>
              </label>
              <el-select
                v-model="form.assetCompany"
                placeholder="会社を選択してください"
                filterable
                clearable
              >
                <el-option
                  v-for="c in companyList"
                  :key="c.companyId"
                  :label="c.companyName"
                  :value="c.companyName"
                />
              </el-select>
            </div>

            <div class="form-group">
              <label>メーカー</label>
              <el-input v-model="form.manufacturer" placeholder="例：Apple / 富士通" />
            </div>

            <div class="form-group">
              <label>型番・モデル名</label>
              <el-input v-model="form.model" placeholder="例：iPhone 13 / FMV-8300" />
            </div>

            <!-- ✅ 資産管理番号 -->
            <div class="form-group">
              <label>資産管理番号（リース会社管理番号）</label>
              <el-input v-model="form.managementNumber" placeholder="例：MNG-2025-001" />
            </div>

            <div class="form-group">
              <label>資産管理番号（自社管理番号）</label>
              <el-input v-model="form.assetnumber" placeholder="例：DELL00001" />
            </div>

            <div class="form-group">
              <label>製造番号</label>
              <el-input v-model="form.serialNumber" placeholder="例：SN-2025-00123" />
            </div>

            <div class="form-group">
              <label>スペック詳細</label>
              <el-input
                v-model="form.spec"
                type="textarea"
                placeholder="CPU、メモリ、容量など"
                :rows="3"
              />
            </div>

            <div class="form-group">
              <label>契約形態</label>
              <el-select v-model="form.contractType" placeholder="選択してください">
                <el-option label="リース" value="リース" />
                <el-option label="購入" value="購入" />
                <el-option label="レンタル" value="レンタル" />
              </el-select>
            </div>

            <!-- ✅ 契約年数 -->
            <div class="form-group">
              <label>契約年数</label>

              <el-input v-model="form.contractYears" placeholder="例：5年" />
            </div>

            <!-- ✅ ライセンス番号 -->
            <div class="form-group">
              <label>ライセンス番号</label>
              <el-input v-model="form.licenseNo" placeholder="例：LIC-2025-0001" />
            </div>

            <!-- ✅ 追加: セキュリティソフト導入 -->
            <div class="form-group">
              <label>セキュリティソフト導入</label>
              <el-select v-model="form.security" placeholder="選択してください">
                <el-option label="有" value="有" />
                <el-option label="無" value="無" />
              </el-select>
            </div>

            <div class="form-group">
              <label>登録日</label>
              <el-date-picker
                v-model="form.registrationDate"
                type="date"
                placeholder="日付を選択"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </div>

            <div class="form-group">
              <label>備考</label>
              <el-input
                v-model="form.remarks"
                type="textarea"
                :rows="3"
                placeholder="備考を入力してください"
              />
            </div>

            <div class="form-buttons">
              <el-button type="primary" @click="saveForm" :loading="saving">
                {{ saving ? '登録中...' : '登録確定' }}
              </el-button>
              <el-button @click="closeForm">キャンセル</el-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import { ElMessageBox, ElMessage } from 'element-plus';

  const API_DEVICES = `${process.env.VUE_APP_API_BASE_URL}/devices`;
  const API_ITEMS = `${process.env.VUE_APP_API_BASE_URL}/items`;
  const API_COMPANIES = `${process.env.VUE_APP_API_BASE_URL}/companies`;

  const search = ref('');
  const tableData = ref([]);
  const itemList = ref([]);
  const companyList = ref([]);
  const showForm = ref(false);
  const saving = ref(false);
  const selectedDevices = ref([]);

  const currentPage = ref(1);
  const pageSize = ref(10);

  // ✅ 端末登録フォーム
  const form = ref({
    deviceId: '',
    deviceStatus: '使用可',
    itemId: '',
    itemName: '',
    assetCompany: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    spec: '',
    contractType: '',
    managementNumber: '',
    assetnumber: '',
    registrationDate: '',
    remarks: '',
    contractYears: '',
    licenseNo: '',
    security: '', // ← 追加
  });

  // 初期ロード
  onMounted(async () => {
    await loadDevices();
    await loadItems();
    await loadCompanies();
  });

  // 一覧取得
  const loadDevices = async () => {
    try {
      const res = await axios.get(`${API_DEVICES}/all`);
      tableData.value = res.data || [];
    } catch {
      ElMessage.error('サーバーから端末データを取得できませんでした。');
    }
  };

  // 品目一覧
  const loadItems = async () => {
    try {
      const res = await axios.get(`${API_ITEMS}/all`);
      itemList.value = res.data || [];
    } catch {
      ElMessage.error('品目一覧の取得に失敗しました。');
    }
  };

  // 会社一覧
  const loadCompanies = async () => {
    try {
      const res = await axios.get(`${API_COMPANIES}/all`);
      companyList.value = res.data || [];
    } catch {
      ElMessage.error('会社一覧の取得に失敗しました。');
    }
  };

  // 検索
  const filterTableData = computed(() => {
    const q = search.value.toLowerCase();
    return tableData.value.filter(
      (row) =>
        !q ||
        row.itemName?.toLowerCase().includes(q) ||
        row.assetCompany?.toLowerCase().includes(q) ||
        row.model?.toLowerCase().includes(q)
    );
  });

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filterTableData.value.slice(start, end);
  });

  // ✅ チェックボックス
  const handleSelectionChange = (selection) => {
    selectedDevices.value = selection;
  };

  // ✅ QR印刷
  const printQR = () => {
    if (selectedDevices.value.length === 0) {
      ElMessage.warning('印刷対象の端末を選択してください。');
      return;
    }

    const payload = selectedDevices.value.map((d) => ({
      deviceId: d.deviceId,
      assetnumber: d.assetnumber || '',
      itemName: d.itemName || '',
      model: d.model || '',
    }));

    // 一時キーを発行
    const key = `k${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(`qr:${key}`, JSON.stringify(payload));

    // 新規タブを開く（完全独立ページ）
    const url = `${window.location.origin}/qr-print.html?key=${encodeURIComponent(key)}`;
    window.open(url, '_blank', 'noopener,noreferrer'); // ← セキュアに
  };

  // ✅ フォーム操作
  const openForm = () => {
    showForm.value = true;
    form.value = { deviceStatus: '使用可' };
  };
  const closeForm = () => {
    showForm.value = false;
    saving.value = false;
  };

  // 品目選択時に item_id 自動設定
  const onItemSelect = (itemName) => {
    const selected = itemList.value.find((i) => i.itemName === itemName);
    if (selected) form.value.itemId = selected.itemId;
  };

  // 登録処理
  const saveForm = async () => {
    if (!form.value.itemId || !form.value.assetCompany || !form.value.assetnumber) {
      ElMessageBox.alert('品目名・会社名・資産管理番号は必須項目です。', '入力エラー', {
        confirmButtonText: 'OK',
        type: 'warning',
        center: true,
      });
      return;
    }

    saving.value = true;
    try {
      const res = await axios.post(`${API_DEVICES}/addition`, form.value);
      const data = res.data;
      if (data.status === 'success') {
        tableData.value = data.devices || [];
        closeForm();
        ElMessage.success('✅ 端末登録が完了しました。');
      } else {
        ElMessageBox.alert(data.message || '登録に失敗しました。', 'エラー', {
          confirmButtonText: 'OK',
          type: 'error',
        });
      }
    } catch {
      ElMessageBox.alert('サーバー通信に失敗しました。', '接続エラー', {
        confirmButtonText: 'OK',
        type: 'error',
      });
    } finally {
      saving.value = false;
    }
  };

  // ✅ 削除処理
  const handleDelete = async (row) => {
    // 確認ダイアログ表示
    ElMessageBox.confirm(
      `端末 [${row.assetnumber || '名称不明'}] を削除してもよろしいですか？`,
      '削除確認',
      {
        confirmButtonText: '削除する',
        cancelButtonText: 'キャンセル',
        type: 'warning',
        center: true,
      }
    )
      .then(async () => {
        try {
          const res = await axios.delete(`${API_DEVICES}/delete/${row.deviceId}`);
          const data = res.data;
          if (data.status === 'success') {
            tableData.value = data.devices || [];
            ElMessage.success('✅ 削除が完了しました。');
          } else {
            ElMessageBox.alert(data.message || '削除に失敗しました。', 'エラー', {
              confirmButtonText: 'OK',
              type: 'error',
            });
          }
        } catch (error) {
          ElMessageBox.alert('サーバー通信に失敗しました。', '接続エラー', {
            confirmButtonText: 'OK',
            type: 'error',
          });
        }
      })
      .catch(() => {
        // キャンセル時
        ElMessage.info('削除をキャンセルしました。');
      });
  };
</script>

<style scoped>
  /* ================================
   🎨 最終版デザイン（背景：白）
   ================================ */

  .container {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background-color: #fff;
    width: 100%;
    overflow-x: auto; /* ✅ 横スクロール対応 */
  }

  /* --- タイトル --- */
  .header {
    margin-bottom: 20px;
  }

  .header h1 {
    font-size: 26px;
    font-weight: 700;
    color: #2c3e50;
    letter-spacing: 1px;
  }

  /* --- ボタンコンテナ --- */
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    margin-bottom: 30px;
    gap: 15px;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 22px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .import-button {
    background: linear-gradient(135deg, #1976d2, #42a5f5);
  }
  .export-button {
    background: linear-gradient(135deg, #ef6c00, #ffb74d);
  }
  .current-category-button {
    background: linear-gradient(135deg, #2e7d32, #66bb6a);
  }

  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  }

  .icon {
    font-size: 18px;
  }

  /* --- モーダル背景 --- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(240, 242, 245, 0.6);
    backdrop-filter: blur(6px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  /* --- モーダルカード --- */
  .modal-card {
    background: linear-gradient(145deg, #ffffff, #f2f4f7);
    border-radius: 16px;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
    padding: 35px 45px;
    width: 520px;
    max-width: 90%;
    animation: popup 0.3s ease;
    border: 1px solid #dbe2eb;
  }

  .modal-card h2 {
    text-align: center;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 25px;
    font-size: 22px;
  }

  /* --- 入力欄 --- */
  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    font-weight: 600;
    color: #455a64;
    margin-bottom: 8px;
    display: inline-block;
  }

  .el-input,
  .el-textarea {
    transition: all 0.3s ease;
  }

  .el-input:focus-within,
  .el-textarea:focus-within {
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.25);
    border-radius: 8px;
  }

  /* --- ボタンエリア --- */
  .form-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 25px;
  }

  /* --- フェード --- */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* --- ポップアニメーション --- */
  @keyframes popup {
    from {
      opacity: 0;
      transform: translateY(-25px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .el-table {
    font-size: 13px; /* ✅ テキストサイズUP */
    line-height: 1.6; /* ✅ 行間を少し広げる */
  }

  /* ヘッダー部分（列タイトル） */
  .el-table th {
    font-size: 17px; /* ✅ ヘッダー文字大きめ */
    font-weight: 700;
    color: #2c3e50;
    background-color: #f5f7fa; /* 淡い背景で区切り感を出す */
  }

  /* セル内のテキスト */
  .el-table td {
    font-size: 16px;
    color: #333;
    padding: 14px 12px; /* ✅ セルの高さを広げる */
  }

  /* ✅ 各列の余白を広めに */
  .el-table__cell {
    padding: 12px 16px !important;
  }

  /* ✅ 行ホバー時の背景も柔らかく */
  .el-table__row:hover > td {
    background-color: #f0f9ff !important;
  }

  /* ✅ ボタンサイズ調整（編集／削除） */
  .el-button {
    font-size: 12px !important;
    padding: 8px 14px !important;
  }

  /* ✅ テーブル横スクロールラッパー */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    border-radius: 10px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  /* === モーダル全体 === */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  /* ✅ モーダルカード固定高さ＋内部スクロール */
  .modal-card {
    background: #fff;
    width: 600px;
    max-width: 95%;
    max-height: 85vh; /* ✅ モーダル高さ固定 */
    border-radius: 12px;
    padding: 25px 35px;
    overflow: hidden; /* 外は固定 */
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  }

  .form-scroll {
    overflow-y: auto; /* ✅ 内部スクロール有効 */
    max-height: 70vh;
    padding-right: 10px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
  .qr-button {
    background: linear-gradient(135deg, #7b1fa2, #ba68c8); /* ← 紫のグラデーション */
  }
</style>
