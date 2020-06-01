<template>
  <div id="wrapper">
    <Header id="head">
      <div id="logo">
        <a href="javascript:void(0)">项目管理工具</a>
      </div>
      <div id="userInfo">
        <Dropdown trigger="click" style="margin-left: 20px">
          <a href="javascript:void(0)">
            <template>
              <Icon type="ios-people" />
            </template>
            我的账户
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem>个人信息</DropdownItem>
            <DropdownItem>设置</DropdownItem>
            <DropdownItem>退出</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </Header>
      <Layout style="height: 100%">
        <Sider>
          <Menu style="height: 100%" theme="light" :active-name="activeMenu"
                width="auto" @on-select="menuClick">
            <MenuGroup title="功能" >
              <MenuItem name="1">
                <Icon type="md-chatbubbles" />
                项目管理
               </MenuItem>
              <MenuItem name="2">
                <Icon type="md-chatbubbles" />
                节点管理
               </MenuItem>
            </MenuGroup>
            <MenuGroup title="其他">
              <MenuItem name="3">
                <Icon type="md-chatbubbles" />
                流量查询
              </MenuItem>
            </MenuGroup>
          </Menu>
        </Sider>
        <Content id="container">
          <router-view/>
        </Content>
    </Layout>
    <Footer id="footer" class="layout-footer-center">2019 &copy; 智慧九宜</Footer>
  </div>
</template>

<script>
export default {
  data(){
    return{
      activeMenu: '1'
    }
  },
  created(){
    var active_name = sessionStorage.getItem(this.$MENU_CACHE)
    if(active_name) this.activeMenu = active_name
  },
  mounted(){
    console.log(this)
  },
  methods: {
    menuClick: function(flag){
      sessionStorage.setItem(this.$MENU_CACHE, flag)
      switch (flag){
        case '1': this.$router.push('/home')
          break
        case '2': this.$router.push('/home/nodeManage')
          break
        case '3': this.$router.push('/home/flowQuery')
      }
    }
  },
  computed:{
  }
}
</script>

<style scoped>
  #wrapper{
    max-width: 1640px;
    min-width: 1366px;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom:0;
    padding: 30px 0;
    margin: auto;
  }
  #head{
    position: absolute;
    top: 0;
    z-index: 1000;
    height: 30px;
    width: 100%;
    display: -webkit-flex;
    justify-content: space-between;
    flex-items: center;
    background-color: #DEE1E6;
  }
  #logo{
    line-height: 30px;
    font-size: 18px;
  }
  #head a{
    color: #7e8c8d;
    font-weight: 400;
    font-family: 宋体;
  }
  #userInfo{
    line-height: 30px;
    font-size: 14px;
  }
  #container{
    background-color: #fff;
    padding: 7px;
    height: 100%;
    overflow: auto;
  }
  .layout-footer-center{
    text-align: center;
    background-color: #DEE1E6;
    height: 30px;
    line-height: 30px;
    padding: 0 3%;
  }
  #footer{
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 1000;
  }
</style>
