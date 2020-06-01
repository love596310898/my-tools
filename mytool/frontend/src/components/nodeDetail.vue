<template>
  <div>
    <Divider class="divider" orientation="left">基本信息</Divider>
    <Card style="width: 100%;">
      <Row class="expand-row">
        <Col span="6">
        <b class="expand-key">节点名称:</b>
        <span class="expand-value">{{nodeData.name}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">节点状态:</b>
        <span class="expand-value">{{statusText[nodeData.status]}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">开始时间:</b>
        <span class="expand-value">{{dateFormat(nodeData.start_time, 'yyyy-mm-dd')}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">结束时间: </b>
        <span class="expand-value">{{dateFormat(nodeData.end_time, 'yyyy-mm-dd')}}</span>
        </Col>
      </Row>
      <div class="details">
        <b style="width: 65px;">节点简介:</b>
        <span class="expand-value">{{nodeData.detail}}</span>
      </div>
    </Card>
    <Divider class="divider" orientation="left">相关操作</Divider>
    <Tabs type="card">
      <TabPane label="进度更新">
        <Card>
          <Form :label-width="80" inline ref="nodeBody" :model="nodeBodyForm" :rules="nodeBodyRules">
            <FormItem label="更新说明" style="width: 50%" prop="body">
              <Input type="textarea" v-model="nodeBodyForm.body"/>
            </FormItem>
            <FormItem label="上传附件">
              <Upload action="//jsonplaceholder.typicode.com/posts/"
                      :on-success="fileUpload" ref="fileUpload">
                <Button icon="ios-cloud-upload-outline">点击上传</Button>
              </Upload>
            </FormItem>
            <FormItem>
              <Button size="small" style="margin-right:20px" @click="nodeUpdateCommit(1)">提交</Button>
              <Button size="small" @click="nodeUpdateCommit(0)">取消</Button>
            </FormItem>
          </Form>
        </Card>
      </TabPane>
      <TabPane label="历史进度">
        <Card v-for="i in nodeData.body" :key="i._id" style="margin-bottom: 10px">
          <Row>
            <Col span="12">
            <b class="expand-key">更新时间:</b>
            <span class="expand-value">{{dateFormat(i.time, 'yyyy-mm-dd')}}</span>
            </Col>
            <Col span="12">
            <b class="expand-key">附件:</b>
            <span class="expand-value" v-for="f in i.file" :key="f._id">{{f.name}}</span>
            </Col>
          </Row>
          <Row>
            <Col>
            <b class="expand-key">更新内容:</b>
            <span class="expand-value">{{i.body}}</span>
            </Col>
          </Row>
        </Card>
      </TabPane>
      <TabPane label="前置节点">
        <Table :columns="nodeColumns" :data="firstNode">
          <template slot-scope="{row}" slot="operate">
            <Button size="small" @click="viewNodeDetail(row)">查看详情</Button>
          </template>
        </Table>
      </TabPane>
      <TabPane label="后置节点">
        <Table :columns="nodeColumns" :data="lastNode">
          <template slot-scope="{row}" slot="operate">
            <Button size="small" @click="viewNodeDetail(row)">查看详情</Button>
          </template>
        </Table>
      </TabPane>
      <TabPane label="修改记录" style="max-height: 400px; overflow-y: auto">
        <Card style="width: 100%; margin-bottom: 10px; "
              v-for="(i, key) in updateRecords" :key="key">
          <Row class="expand-row">
            <Col span="6">
            <b class="expand-key">修改时间:</b>
            <span class="expand-value">{{dateFormat(i.modify_time, 'yyyy-mm-dd')}}</span>
            </Col>
            <Col span="6">
            <b class="expand-key">开始时间:</b>
            <span class="expand-value">{{dateFormat(i.start_time, 'yyyy-mm-dd')}}</span>
            </Col>
            <Col span="6">
            <b class="expand-key">结束时间:</b>
            <span class="expand-value">{{dateFormat(i.end_time, 'yyyy-mm-dd')}}</span>
            </Col>
            <Col span="6">
            <b class="expand-key">状态:</b>
            <span class="expand-value">{{statusText[i.status]}}</span>
            </Col>
          </Row>
          <div class="details">
            <b style="width:76px;">修改原因:</b>
            <span class="expand-value">{{i.reason}}</span>
          </div>
        </Card>
      </TabPane>
      <TabPane label="变更">
        <Card style="width: 100%;">
          <Row class="expand-row" :gutter="50">
            <Col span="10">
            <b class="expand-key">状态:</b>
            <span class="expand-value">{{isFinish.status ? '可操作' : '不可操作'}}</span>
            </Col>
            <Col span="10">
            <b class="expand-key">不可操作原因:</b>
            <span class="expand-value">{{isFinish.text}}</span>
            </Col>
            <Col span="2" align="right">
            <Button size="small" @click="nodeDone" :disabled="!isFinish.status">
              {{isFinish.finish ? '取消完结' : '完结'}}
            </Button>
            </Col>
          </Row>
        </Card>
        <Card style="width: 100%;">
          <Row class="expand-row" :gutter="50">
            <Col span="10">
            <b class="expand-key">状态:</b>
            <span class="expand-value">{{isUpdate.status ? '可修改' : '不可修改'}}</span>
            </Col>
            <Col span="10">
            <b class="expand-key">不可修改原因:</b>
            <span class="expand-value">{{isUpdate.text}}</span>
            </Col>
            <Col span="2" align="right">
            <router-link :to="{path: 'nodeEdit'}">
              <Button size="small" :disabled="!isUpdate.status">修改</Button>
            </router-link>
            </Col>
          </Row>
        </Card>
        <Card style="width: 100%; margin-bottom: 10px;">
          <Row class="expand-row" :gutter="50">
            <Col span="10">
            <b class="expand-key">状态:</b>
            <span class="expand-value">{{isDelete.status ? '可删除': '不可删除'}}</span>
            </Col>
            <Col span="10">
            <b class="expand-key">不可删除原因:</b>
            <span class="expand-value">{{isDelete.text}}</span>
            </Col>
            <Col span="2" align="right">
            <Button size="small" :disabled="!isDelete.status" @click="nodeDelete">删除</Button>
            </Col>
          </Row>
        </Card>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
  import expandRow from './tableExpand.vue'
  export default {
    data () {
      return {
        openPanel:[1],
        nodeData: {},
        nodeColumns: [
          {
            type: 'expand',
            width: 80,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  row: params.row,
                  title: '节点简介'
                }
              })
            }
          },
          {
            title: '节点名称',
            key: 'name'
          },
          {
            title: '开始时间',
            render: (h, params) => {
              return h('span', this.dateFormat(new Date(params.row.start_time), 'yyyy-mm-dd'))
            }
          },
          {
            title: '结束时间',
            render: (h, params) => {
              return h('span', this.dateFormat(new Date(params.row.end_time), 'yyyy-mm-dd'))
            }
          },
          {
            title: '状态',
            render: (h, params) => {
              return h('span', this.statusText[params.row.status])
            }
          },
          {
            title: '操作',
            slot: 'operate',
            width: 150,
            align: "center"
          }
        ],
        firstNode: [],
        lastNode: [],
        nodeBodyForm:{
          body: '',
          file: []
        },
        nodeBodyRules:{
          body:[{required: true, message:'请填写更新内容'}]
        },
        updateRecords:[]
      }
    },
    created(){
     this.init()
    },
    methods: {
      init(){
        this.nodeData = JSON.parse(sessionStorage.getItem(this.$NODE_CACHE_NAME))
        this.getFirstAndLastNode()
        this.getUpdateRecord()
      },
      getUpdateRecord(){
        var que = {belong_id: this.nodeData._id}
        this.$post('node/getUpdateRecord', {que: JSON.stringify(que)})
          .then( res => {
            if (res.data) {
              this.updateRecords = res.data
            }
          })
          .catch( res => console.log(res))
      },
      fileUpload(res, file, fileList){
        this.nodeBodyForm.file.push(file)
      },
      nodeUpdateCommit(flag){
        var nodeBodyForm = this.$refs['nodeBody']
        var fileUpload = this.$refs['fileUpload']
        if(flag){
          nodeBodyForm.validate( valid => {
            if(!valid) return
            var que = JSON.stringify({_id: this.nodeData._id})
            var par = JSON.stringify({$push:{body:this.nodeBodyForm}})
            this.$post('node/setBody', {que, par})
              .then( res => {
                var nodeData = res.data
                this.nodeData = nodeData
                sessionStorage.setItem(this.$NODE_CACHE_NAME, JSON.stringify(nodeData))
                setTimeout(()=>{
                  fileUpload.clearFiles()
                  nodeBodyForm.resetFields()
                  this.nodeBodyForm.file = []
                })
              })
              .catch( res => {
                this.$Message.error('进度更新失败')
                console.log(res)
              })
          })
        } else {
          nodeBodyForm.resetFields()
        }
      },
      getFirstAndLastNode(){
        var firstQuery = {_id: this.nodeData.first_node}
        var lastQuery = {_id: this.nodeData.last_node}
        getNode.call(this, firstQuery, 'firstNode')
        getNode.call(this, lastQuery, 'lastNode')
        function getNode(que , name){
          if(que._id.length){
            this.$post('node/find', {que: JSON.stringify(que)})
              .then( res => {
                this[name] = res.data
              })
              .catch( res => {
                var text = name == 'firstNode' ? '获取前置节点失败' : '获取后置节点失败'
                this.$Message.error(text)
              })
          } else {
            this[name] = []
          }
        }
      },
      viewNodeDetail(node){
        sessionStorage.setItem(this.$NODE_CACHE_NAME, JSON.stringify(node))
        this.init()
      },
      nodeDelete(){
        this.$Modal.confirm({
          title: '是否确认删除本节点',
          onOk: () => {
            var que = {_id: this.nodeData._id}
            this.$post('node/delete', {que: JSON.stringify(que)})
              .then( res => {
                this.$Message.success('删除成功')
                console.log(res)
                setTimeout( () => {
                  this.$router.push({path: 'nodeManage'})
                })
              })
              .catch( res => {
                this.$Message.error('删除失败')
                console.log(res)
              })
          }
        })
      },
      nodeDone(){
        var node = this.nodeData, status = node.status
        switch (status) {
          case 1 : status = 3
            break
          case 2 : status = 4
            break
          default : computeStatus()
        }
        function computeStatus(){
          if(new Date(node.end_time) >= Date.now()){
            status = 1
          } else {
            status = 2
          }
        }

        var que = JSON.stringify({_id: node._id}), par = JSON.stringify({$set:{status}})
        console.log(que, par)
        this.$post('node/updateStatus', {que, par})
          .then( res => {
            var data = res.data
            sessionStorage.setItem(this.$NODE_CACHE_NAME, JSON.stringify(data))
            this.init()
            this.$Message.success('修改成功')
          })
          .catch( res => {
            this.$Message.error('修改失败')
            console.log(res)
          })
      }
    },
    computed:{
      statusText(){
        return this.$STATUS_TEXT
      },
      dateFormat(){
        return this.$dateFormat
      },
      isDelete(){
        var result = {}, node = this.nodeData
        if(node.status > 0 ){
          result.text = (node.status) > 2 ? '节点已完结' :'节点进行中'
          result.status = false
        } else if(node['last_node'].length > 0){
          result.text = '节点存在后置节点'
          result.status = false
        } else {
          result.text = '无'
          result.status = true
        }
        return result
      },
      isFinish(){
        var result = {}, node = this.nodeData, isBegin = (node.status > 0)
        result.text = isBegin ? '无' : '节点未开始'
        result.status = isBegin
        result.finish = (node.status > 2)
        return result
      },
      isUpdate(){
        var result = {}, node = this.nodeData, status = node.status < 3
        result.status = status
        result.text = status ? '无' : '完结状态不可进行修改'
        return result
      }
    },
    components: {}
  }
</script>

<style scoped>
  .expand-row{
    margin-bottom: 16px;
  }
  .expand-value{
    padding-left: 10px;
  }
  .details{
    display: flex;
    display: -webkit-flex;
  }
  .divider{
    font-size: 14px;
  }
  .create{
    display: flex;
    display: -webkit-flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
