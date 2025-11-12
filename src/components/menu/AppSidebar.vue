<template>
  <aside class="sidebar">
    <nav class="nav-menu">
      <!-- メインメニュー項目 -->
      <div class="nav-item" @click="toggleSubMenu('ryuko')">
        <Menu class="icon" />
        <span>資産管理</span>
        <i class="dropdown-icon">
          <ArrowDown v-if="activeMenu === 'ryuko'" />
          <ArrowRight v-else />
        </i>
      </div>
      <div v-if="activeMenu === 'ryuko'" class="sub-menu">
        <router-link to="/itemcategories" class="sub-item">カテゴリー</router-link>
        <router-link to="/companies" class="sub-item">資産会社登録</router-link>
        <router-link to="/office_master" class="sub-item">営業所登録</router-link>
        <router-link to="/drvice_management" class="sub-item">端末台帳</router-link>
        <router-link to="/loan_management" class="sub-item">貸出履歴台帳</router-link>
        <router-link to="/loan_state" class="sub-item">貸出状況</router-link>
      </div>

      <!-- 出庫のメインメニュー -->
      <!-- <div class="nav-item" @click="toggleSubMenu('syuko')">
        <Briefcase class="icon" />
        <span>出庫業務</span>
        <i class="dropdown-icon">
          <ArrowDown v-if="activeMenu === 'syuko'" />
          <ArrowRight v-else />
        </i>
      </div> -->
      <!-- <div v-if="activeMenu === 'syuko'" class="sub-menu">
        <router-link to="/syukoschedule" class="sub-item">出庫予定登録</router-link>
        <router-link to="/syukostatus" class="sub-item">出庫進捗</router-link>
        <router-link to="/syukohikiate" class="sub-item">出庫引当処理</router-link>
        <router-link to="/syukohikiate" class="sub-item">出庫残数比較</router-link>
        <router-link to="/syukogurosu" class="sub-item">出庫グロス帳票</router-link>
        <router-link to="/syukoconfirm" class="sub-item">出庫確定</router-link>
        <router-link to="/syukoachievements" class="sub-item">出庫実績</router-link>
      </div> -->

      <!-- 商品マスタのメインメニュー -->
      <!-- <div class="nav-item" @click="toggleSubMenu('master')">
        <Edit class="icon" />
        <span>マスタ関連</span>
        <i class="dropdown-icon">
          <ArrowDown v-if="activeMenu === 'master'" />
          <ArrowRight v-else />
        </i>
      </div>
      <div v-if="activeMenu === 'master'" class="sub-menu">
        <router-link to="/itemmaster" class="sub-item">商品マスタ</router-link>
        <router-link to="/customermaster" class="sub-item">得意先マスタ</router-link>
        <router-link to="/warehousemaster" class="sub-item">倉庫マスタ</router-link>
        <router-link to="/tastemaster" class="sub-item">品目マスタ</router-link>
        <router-link to="/shopmaster" class="sub-item">店舗マスタ</router-link>
        <router-link to="/productionmaster" class="sub-item">寄託マスタ</router-link>
        <router-link to="/coursemaster" class="sub-item">コースマスタ</router-link>
      </div> -->

      <!-- 在庫管理のメインメニュー -->
      <!-- <div class="nav-item" @click="toggleSubMenu('stock')">
        <SwitchFilled class="icon" />
        <span>在庫管理</span>
        <i class="dropdown-icon">
          <ArrowDown v-if="activeMenu === 'stock'" />
          <ArrowRight v-else />
        </i>
      </div>
      <div v-if="activeMenu === 'stock'" class="sub-menu">
        <router-link to="/location" class="sub-item">在庫移動登録</router-link>
        <router-link to="/refill" class="sub-item">補充帳票印刷</router-link>
        <router-link to="/refilllist" class="sub-item">補充登録実績</router-link>
        <router-link to="/locationprogress" class="sub-item">在庫移動進捗</router-link>
        <router-link to="/adjustment" class="sub-item">在庫移動実績</router-link>
        <router-link to="/inventory" class="sub-item">棚卸登録</router-link>
        <router-link to="/inventorystatus" class="sub-item">棚卸進捗</router-link>
        <router-link to="/inventorydata" class="sub-item">棚卸実績</router-link>
      </div> -->
    </nav>
  </aside>
</template>

<script setup>
  import { ref } from 'vue';
  import {
    // Briefcase,
    ArrowDown,
    ArrowRight,
    Menu,
    // Edit,
    // SwitchFilled,
  } from '@element-plus/icons-vue';

  // 現在アクティブなメニューを管理
  const activeMenu = ref(null);

  const toggleSubMenu = (menu) => {
    activeMenu.value = activeMenu.value === menu ? null : menu;
  };
</script>

<style scoped>
  .sidebar {
    width: 250px;
    height: 110vh;
    background: linear-gradient(180deg, #3a4a5b, #5a6b7c);
    color: #bfcbd9;
    padding-top: 20px;
  }

  .nav-menu {
    display: flex;
    flex-direction: column;
  }

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 矢印を右端に配置 */
    padding: 10px 20px;
    color: #bfcbd9;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: border-color 0.3s;
  }

  .nav-item:hover {
    border-color: #409eff;
  }

  .sub-menu {
    font-size: 60px;
    padding-left: 60px; /* サブメニューのインデント */
    background-color: #404a56;
  }

  .sub-item {
    display: block;
    color: #e7eaee;
    text-decoration: none;
    padding: 5px 0;
    font-size: 14px;
  }

  .sub-item:hover {
    color: #37eee5;
  }

  .icon {
    width: 25px; /* アイコンのサイズ */
    height: 25px;
    margin-right: 8px;
  }

  .dropdown-icon {
    font-size: 16px;
    margin-left: auto; /* 右端に配置 */
    transition: transform 0.3s ease; /* 矢印の回転アニメーション用 */
  }
</style>
