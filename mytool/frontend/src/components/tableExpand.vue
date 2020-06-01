/**
* Created by lenovo on 2019/3/13.
 */
<template>
  <div id="details">
    <div style="width: 90%">
      <b class="expand-key" style="font-size: 14px">{{title}}:&nbsp; </b>
      <span class="expand-value">{{ row.detail }}</span>
    </div>
    <Button v-if="isLook" size="small" style="height: 24px">查看详情</Button>
  </div>
</template>

<script>
  export default {
    props: {
      row: Object,
      title: String,
      isLook: Boolean
    }
  };
</script>

<style scoped>
  #details{
    display: flex;
    display: -webkit-flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
