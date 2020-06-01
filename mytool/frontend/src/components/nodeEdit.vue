<template>
  <Tabs type="card" closable
        v-model="activeKey"
        :before-remove="beforeTabRemove">
    <TabPane v-for="tab in tabs" :key="tab.name" :name="tab.name"
             :label="tab.name">
      <Edit :tab="tab" v-on:createTab="createTab" :ref="tab.name"></Edit>
    </TabPane>
    <Button @click="refresh" size="small" slot="extra">刷新</Button>
  </Tabs>
</template>

<script>
  import edit from './edit.vue'
  export default {
    data () {
      return {
        tabs: [],
        activeKey: ''
      }
    },
    created(){
      this.init()
    },
    methods: {
      init(){
        var node = JSON.parse(sessionStorage.getItem(this.$NODE_CACHE_NAME))
        this.createTab(node)
      },
      createTab(node){
        if(this.tabs.length) {
          if(!this.tabs.some(i => i._id == node._id)){
            this.tabs.push(node)
          }
        } else {
          this.tabs.push(node)
        }
        this.activeKey = node.name
      },
      beforeTabRemove(index){
        if(index == 0) return new Promise(()=>{
            this.$Message.warning('不可删除最后的页签');
        })
        this.tabs = this.tabs.filter( (item, i) => {
          return index != i
        })
      },
      refresh(){
        this.tabs.forEach( tab => {
          this.$refs[tab.name][0].init()
        })
      }
    },
    components: {
      Edit: edit
    }
  }
</script>

<style scoped>
</style>
