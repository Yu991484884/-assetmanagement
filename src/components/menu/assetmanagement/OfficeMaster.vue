<template>
  <div class="container">
    <!-- ✅ タイトル -->
    <div class="header">
      <h1>営業所一覧</h1>
    </div>

    <!-- ✅ ボタンコンテナ -->
    <div class="action-buttons">
      <button class="action-button import-button">
        <i class="icon fas fa-file-import"></i>
        インポート
      </button>
      <button class="action-button export-button">
        <i class="icon fas fa-file-export"></i>
        エクスポート
      </button>
      <button class="action-button current-category-button" @click="openForm">
        <i class="icon fas fa-store"></i>
        営業所登録
      </button>
    </div>

    <!-- ✅ テーブル -->
    <el-table :data="paginatedData" style="width: 100%">
      <el-table-column label="営業所コード" prop="officeId" width="220" />
      <el-table-column label="営業所名" prop="officeName" width="300" />
      <el-table-column label="会社名" prop="companyName" width="250" />
      <el-table-column label="備考" prop="remarks" />
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

    <!-- ✅ 新規登録モーダル -->
    <transition name="fade">
      <div v-if="showForm" class="modal-overlay">
        <div class="modal-card">
          <h2>営業所登録</h2>

          <div class="form-group">
            <label>
              営業所コード
              <span class="required">*</span>
            </label>
            <el-input v-model="form.officeId" placeholder="例：YKBC-001" clearable />
          </div>

          <div class="form-group">
            <label>
              営業所名
              <span class="required">*</span>
            </label>
            <el-input v-model="form.officeName" placeholder="例：横浜営業所" clearable />
          </div>

          <div class="form-group">
            <label>
              会社名
              <span class="required">*</span>
            </label>
            <el-select
              v-model="form.companyName"
              placeholder="会社を選択してください"
              filterable
              clearable
              @change="onCompanySelect"
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
            <label>備考</label>
            <el-input
              v-model="form.remarks"
              type="textarea"
              :rows="3"
              placeholder="例：主要拠点・本社直轄など"
              clearable
            />
          </div>

          <div class="form-buttons">
            <el-button type="primary" @click="saveForm" :loading="saving">
              {{ saving ? '登録中...' : '確定' }}
            </el-button>
            <el-button @click="closeForm">キャンセル</el-button>
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

  /* ========================================
 🎨 メッセージボックス共通設定
======================================== */
  const customBoxStyle = {
    customClass: 'custom-message-box',
    center: true,
    roundButton: true,
  };

  const showSuccessBox = (msg = '登録が完了しました。') => {
    ElMessageBox.alert(
      `<div class="msg-success">
        <i class="el-icon-circle-check" style="color:#43a047;font-size:52px;"></i>
        <p class="msg-text">${msg}</p>
     </div>`,
      '🎉 完了',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: 'OK',
        ...customBoxStyle,
      }
    );
  };

  const showDeleteConfirm = (officeName) => {
    return ElMessageBox.confirm(
      `<div class="msg-warning">
        <i class="el-icon-warning-outline" style="color:#e53935;font-size:52px;"></i>
        <p class="msg-text">選択された営業所「<b>${officeName}</b>」を削除しますか？</p>
        <small>この操作は元に戻せません。</small>
     </div>`,
      '⚠️ 削除の確認',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '削除',
        cancelButtonText: 'キャンセル',
        type: 'warning',
        ...customBoxStyle,
      }
    );
  };

  /* ========================================
 ⚙️ API定義
======================================== */
  const API_OFFICES = `${process.env.VUE_APP_API_BASE_URL}/offices`;
  const API_COMPANIES = `${process.env.VUE_APP_API_BASE_URL}/companies`;

  const search = ref('');
  const tableData = ref([]);
  const companyList = ref([]);
  const showForm = ref(false);
  const saving = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);

  const form = ref({
    officeId: '',
    officeName: '',
    companyId: '',
    companyName: '',
    remarks: '',
  });

  /* ========================================
 🚀 初期ロード
======================================== */
  onMounted(async () => {
    await loadOffices();
    await loadCompanies();
  });

  const loadOffices = async () => {
    try {
      const res = await axios.get(`${API_OFFICES}/all`);
      tableData.value = res.data || [];
    } catch (error) {
      console.error('❌ データ取得エラー:', error);
      ElMessage.error('サーバーから営業所データを取得できませんでした。');
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await axios.get(`${API_COMPANIES}/all`);
      companyList.value = res.data || [];
    } catch (error) {
      console.error('❌ 会社データ取得エラー:', error);
      ElMessage.error('会社一覧の取得に失敗しました。');
    }
  };

  /* ========================================
 🔍 検索・ページネーション
======================================== */
  const filterTableData = computed(() => {
    const q = (search.value || '').toLowerCase();
    return tableData.value.filter(
      (row) =>
        !q ||
        (row.officeId && row.officeId.toLowerCase().includes(q)) ||
        (row.officeName && row.officeName.toLowerCase().includes(q)) ||
        (row.companyName && row.companyName.toLowerCase().includes(q))
    );
  });

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filterTableData.value.slice(start, end);
  });

  const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
  };
  const handleCurrentChange = (val) => (currentPage.value = val);

  /* ========================================
 📝 モーダル開閉
======================================== */
  const openForm = () => {
    showForm.value = true;
    form.value = { officeId: '', officeName: '', companyId: '', companyName: '', remarks: '' };
  };
  const closeForm = () => {
    showForm.value = false;
    saving.value = false;
  };

  /* ✅ 会社選択時の company_id 自動設定 */
  const onCompanySelect = (companyName) => {
    const selected = companyList.value.find((c) => c.companyName === companyName);
    if (selected) form.value.companyId = selected.companyId;
  };

  /* ========================================
 💾 新規登録処理
======================================== */
  const saveForm = async () => {
    if (!form.value.officeId.trim() || !form.value.officeName.trim() || !form.value.companyId) {
      ElMessageBox.alert('営業所コード・営業所名・会社名は必須項目です。', '入力エラー', {
        confirmButtonText: 'OK',
        type: 'warning',
        center: true,
      });
      return;
    }

    saving.value = true;
    try {
      const res = await axios.post(`${API_OFFICES}/addition`, form.value);
      const data = res.data;

      if (data.status === 'success') {
        tableData.value = data.offices || [];
        closeForm();
        showSuccessBox('✅ 営業所の登録が完了しました。');
      } else {
        ElMessageBox.alert(data.message || '登録に失敗しました。', 'エラー', {
          confirmButtonText: 'OK',
          type: 'error',
          center: true,
        });
      }
    } catch (error) {
      console.error('❌ 登録エラー:', error);
      ElMessageBox.alert('サーバー通信に失敗しました。', '接続エラー', {
        confirmButtonText: 'OK',
        type: 'error',
        center: true,
      });
    } finally {
      saving.value = false;
    }
  };

  /* ========================================
 🗑️ 削除処理
======================================== */
  const handleDelete = async (row) => {
    try {
      await showDeleteConfirm(row.officeName);

      const res = await axios.delete(`${API_OFFICES}/delete/${row.officeId}`);
      const data = res.data;
      tableData.value = data.offices || [];

      if (data.status === 'success') {
        ElMessage.success('🗑️ 削除が完了しました。');
      } else {
        ElMessageBox.alert(data.message || '削除に失敗しました。', 'エラー', {
          confirmButtonText: 'OK',
          type: 'error',
          center: true,
        });
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('❌ 削除エラー:', error);
        ElMessageBox.alert('サーバー通信中にエラーが発生しました。', '通信エラー', {
          confirmButtonText: 'OK',
          type: 'error',
          center: true,
        });
      }
    }
  };

  /* ========================================
 ✏️ 編集機能（後日拡張用）
======================================== */
  const handleEdit = (row) => {
    console.log('編集クリック:', row);
    alert('編集機能は今後追加予定です。');
  };
</script>

<style scoped>
  /* ================================
   🎨 最終版デザイン（背景：白）
   ================================ */

  .container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    background-color: #ffffff; /* ✅ 白背景に戻す */
    min-height: 100vh;
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
</style>
