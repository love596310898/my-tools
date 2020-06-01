<template>
  <div>
    <Divider class="divider" orientation="left">基本信息</Divider>
    <Card style="width: 100%;">
      <Row class="expand-row">
        <Col span="6">
        <b class="expand-key">项目名称:</b>
        <span class="expand-value" v-if="proInfo">{{proInfo.name}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">项目状态:</b>
        <span class="expand-value" v-if="proInfo">{{statusText[proInfo.status]}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">开始时间:</b>
        <span class="expand-value" v-if="proInfo">{{dateFormat(proInfo.start_time, "yyyy-mm-dd")}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">结束时间: </b>
        <span class="expand-value" v-if="proInfo">{{dateFormat(proInfo.end_time, "yyyy-mm-dd")}}</span>
        </Col>
      </Row>
      <div class="details">
        <b style="width: 6%;">项目简介:</b>
        <span class="expand-value">{{proInfo.detail}}</span>
      </div>
    </Card>
    <Divider class="divider" orientation="left">相关操作</Divider>
    <Tabs type="card">
      <TabPane label="包含任务">
        <Collapse v-model="openPanel">
          <Panel name="1">
            任务列表
            <div slot="content">
              <Table :columns="taskColumns" :data="taskList">
                <template slot-scope="{row}" slot="operate">
                  <Button size="small" style="margin-right: 10px;"
                          @click="taskModify(row, 1)">修改</Button>
                  <Button size="small" @click="taskModify(row, 2)">删除</Button>
                </template>
              </Table>
          </div>
          </Panel>
          <Panel name="2" v-show="taskIsEdit">
            修改任务
            <div slot="content" class="create">
            <Form :label-width="80" style="width: 85%;" ref="taskModifyForm"
                  :model="taskModifyForm" :rules="taskFormRules">
              <FormItem label="项目名称" style="width: 100%;" prop="name">
                <Input size="small"  placeholder="请输入项目名称" v-model="taskModifyForm.name"/>
              </FormItem>
              <FormItem label="项目简述" placeholder="请输入项目简介"
                        style="width: 100%" prop="detail">
                <Input type="textarea"  v-model="taskModifyForm.detail"/>
              </FormItem>
            </Form>
            <div style="width: 15%; text-align: center; padding-left: 12px">
              <Button size="small" style="margin-right: 10px" @click="taskCommit(2)">提交</Button>
              <Button size="small" @click="taskCommit(3)">取消</Button>
            </div>
          </div>
          </Panel>
          <Panel name="3" v-show="!taskIsEdit">
            新建任务
            <div slot="content" class="create">
            <Form :label-width="80" style="width: 85%;" ref="taskForm"
                  :model="taskForm" :rules="taskFormRules">
              <FormItem label="任务名称" style="width: 100%;" prop="name">
                <Input size="small" v-model="taskForm.name" placeholder="请输入任务名称"/>
              </FormItem>
              <FormItem label="任务简述" style="width: 100%" prop="detail">
                <Input type="textarea" v-model="taskForm.detail" placeholder="请输入任务简述"/>
              </FormItem>
            </Form>
            <div style="width: 15%; text-align: center; padding-left: 12px">
              <Button size="small" style="margin-right: 10px"
                      @click="taskCommit(1)">创建</Button>
              <Button size="small" @click="taskCommit">取消</Button>
            </div>
          </div>
          </Panel>
        </Collapse>
      </TabPane>
      <TabPane label="包含节点">
        <Table :columns="nodeColumns" :data="nodeList">
          <template slot-scope="{row}" slot="operate">
            <Button size="small" @click="viewNode(row)">查看详情</Button>
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
      <TabPane label="完结与删除">
        <Card style="width: 100%; margin-bottom: 10px;">
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
            <Button size="small" @click="proDone" :disabled="!isFinish.status">
              {{isFinish.finish ? '取消完结' : '完结'}}
            </Button>
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
            <Button size="small" @click="proDelete" :disabled="!isDelete.status">删除</Button>
            </Col>
          </Row>
        </Card>
        <Card style="width: 100%; margin-bottom: 10px;">
          <Row class="expand-row" :gutter="50">
            <Col span="10">
            <b class="expand-key">状态:</b>
            <span class="expand-value">{{isUpdate.status ? '可修改': '不可修改'}}</span>
            </Col>
            <Col span="10">
            <b class="expand-key">不可修改原因:</b>
            <span class="expand-value">{{isUpdate.text}}</span>
            </Col>
          </Row>
        </Card>
      </TabPane>
      <TabPane label="修改" v-if="isUpdate.status">
        <Divider class="divider" orientation="left">限制条件</Divider>
        <Card style="width: 100%">
          <Row class="expand-row">
            <Col span="12">
            <b class="expand-key">开始时间:</b>
            <span class="expand-value" style="margin-right: 30px; color: red">{{timeBox.start_time}}</span>
            <Button size="small"
                    :disabled="!nodeList.length"
                    @click="viewNode(nodeList[0])">查看此节点</Button>
            </Col>
            <Col span="12">
            <b class="expand-key">结束时间: </b>
            <span class="expand-value" style="margin-right: 30px; color: red">{{timeBox.end_time}}</span>
            <Button size="small"
                    :disabled="!nodeList.length"
                    @click="viewNode(nodeList[nodeList.length - 1])">查看此节点</Button>
            </Col>
          </Row>
        </Card>
        <Card style="width: 100%">
          <Form :label-width="80" ref="proForm" :model="proForm" :rules="formRules" inline>
            <FormItem label="项目名称" style="width: 32%" prop="name">
              <Input size="small" v-model="proForm.name"  placeholder="输入项目名称"/>
            </FormItem>
            <FormItem class="timeStar" label="开始日期" style="width: 32%" prop="start_time">
              <DatePicker
                v-model="proForm.start_time"
                style="width:100%;"
                size="small"
                format="yyyy/MM/dd"
                type="date" placement="bottom-end"
                placeholder="输入开始时间"
                class="itemsWidth">
              </DatePicker>
            </FormItem>
            <FormItem label="结束日期" style="width: 32%" prop="end_time">
              <DatePicker
                v-model="proForm.end_time"
                style="width:100%;"
                size="small"
                format="yyyy/MM/dd"
                type="date" placement="bottom-end"
                placeholder="输入结束时间"
                class="itemsWidth">
              </DatePicker>
            </FormItem>
            <FormItem label="项目简介" style="width: 38%" prop="detail">
              <Input type="textarea" v-model="proForm.detail"/>
            </FormItem>
            <FormItem label="修改原因" style="width: 38%" prop="reason">
              <Input type="textarea" v-model="proForm.reason"/>
            </FormItem>
            <FormItem align="right">
              <Button size="small" style="margin-right:20px" @click="modifyPro(1)">修改</Button>
              <Button size="small" @click="modifyPro(0)">取消</Button>
            </FormItem>
          </Form>
        </Card>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
  import expandRow from './tableExpand.vue'
  export default {
    data () {
      var name = (rule, value, cb) => {
        if(!value) return cb()
        var que = JSON.stringify({name: value})
        this.$post('pro/verifyName', {que})
          .then( res => {
            if(res.data){
              cb('名称已经被使用')
            } else {
              cb()
            }
          })
          .catch( res => {
            cb('名称验证失败')
            console.log(res)
          })
      }
      var startTime = (rule, value, cb) => {
        if(!value) return cb()
        var form = this.proForm, nodeList = this.nodeList, pro = this.proInfo
        if(value > (form.end_time ? form.end_time : new Date(pro.end_time))){
          cb('开始时间不可大于项目结束时间')
        } else if(nodeList.length && value > new Date(nodeList[0].start_time)){
          cb('开始时间不可大于子节点开始时间')
        } else {
          cb()
        }
      }
      var endTime = (rule, value, cb) => {
        if(!value) return cb()
        var form = this.proForm, nodeList = this.nodeList, pro = this.proInfo
        if(value < (form.start_time ? form.start_time : new Date(pro.start_time))){
          cb('结束时间不可小于项目开始时间')
        } else if(nodeList.length && value < new Date(nodeList[ nodeList.length - 1 ].end_time)){
          cb('结束时间不可小于子节点结束时间')
        } else {
          cb()
        }
      }
      return {
        taskIsEdit: false,
        openPanel:[1,3],
        taskColumns: [
          {
            type: 'expand',
            width: 80,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  row: params.row,
                  title: '任务简介',
                  isLook: false
                }
              })
            }
          },
          {
            title: '任务名称',
            key: 'name'
          },
          {
            title: '开始时间',
            render: (h, params) => {
              var time = params.row.start_time
              var dateText = time ? this.$dateFormat(time, 'yyyy-mm-dd') : '暂无'
              return h('span',dateText)
            }
          },
          {
            title: '结束时间',
            render: (h, params) => {
              var time = params.row.end_time
              var dateText = time ? this.$dateFormat(time, 'yyyy-mm-dd') : '暂无'
              return h('span',dateText)
            }
          },
          {
            title: '操作',
            slot: 'operate',
            width: 150,
            align: "center"
          }
        ],
        taskList: [],
        taskForm:{
          name:'',
          detail:''
        },
        taskModifyForm:{
          name:'',
          detail:''
        },
        taskFormRules:{
          name:[{type: 'string', required:true, message:'请输入任务名称'}],
          detail:[{type: 'string', required: true, message: '请输入任务描述'}]
        },
        proInfo: null,
        proForm:{
          name: '',
          start_time: '',
          end_time: '',
          detail: '',
          reason: ''
        },
        formRules:{
          name:[{validator: name, trigger: 'blur'}],
          start_time:[{validator: startTime, trigger: 'blur'}],
          end_time:[{validator: endTime, trigger: 'blur'}],
          detail:[],
          reason: [{required: true, message:'请填写修改原因', trigger: 'blur'}]
        },
        proFormRules:{
          reason:[{required: true, message: '修改原因必须填写', trigger: 'blue'}]
        },
        updateRecords:[],
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
        nodeList: [],
      }
    },
    created(){
      this.init()
    },
    methods: {
      init(){
        this.proInfo = JSON.parse(sessionStorage.getItem(this.$PRO_CACHE_NAME))
        this.getTask()
        this.getNode()
        this.getHistory()
      },
      getTask(){
        this.$post('pro/getTask', {id: this.proInfo._id}).then( res => {
          this.taskList = res.data
        }).catch( err => {
          console.log(err)
        })
      },
      taskCommit(flag){
        var form = this.$refs['taskForm'], form2 = this.$refs['taskModifyForm']
        if(flag == 1){//创建
          form.validate( valid =>{
            if(!valid) return
            var par = this.taskForm
            par.belong_id = this.proInfo._id
            this.$post('pro/createTask', {par: JSON.stringify(par)}).then( res => {
              this.$Message.success('创建成功')
              form.resetFields()
              this.getTask()
            }).catch( err => {
              this.$Message.error('创建失败')
              console.log(err)
            })
          })
        } else if(flag == 2){//修改
          form2.validate( valid => {
            if(!valid) return
            var id = this.taskModifyForm.id, formData = this.taskModifyForm
            var par = JSON.stringify({name: formData.name, detail: formData.detail})
            this.$post('pro/modifyTask', {id, par}).then( res => {
              this.$Message.success('修改成功')
              this.getTask()
              this.taskIsEdit = false
              setTimeout( () => {this.openPanel = [1, 3]}, 200)
            }).catch( err => {
              this.$Message.error('修改失败')
              console.log(err)
            })
          })
        } else if(flag == 3){ //取消修改
          this.taskIsEdit = false
          setTimeout( () => {this.openPanel = [1, 3]}, 500)
        } else { //取消创建
          form.resetFields()
        }
      },
      taskModify(row, flag){
        this.taskIsEdit = flag == 1
        if(flag == 1){ //修改
            var formData = this.taskModifyForm
            formData.name = row.name
            formData.detail = row.detail
            formData.id = row._id
            setTimeout( () => {this.openPanel = [1, 2]}, 500)
        } else if(flag == 2) { //删除
          this.$post('node/find', {que: JSON.stringify({task_id: row._id})})
            .then( res => {
              if (res.data.length) {
                this.$Message.warning('任务下存在节点，不可删除')
              } else {
                this.$post('pro/deleteTask', {id:row._id}).then( res => {
                  this.$Message.success('删除成功')
                  this.getTask()
                }).catch( err => {
                  this.$Message.error('删除失败')
                  console.log(err)
                })
              }
            })

        }
      },
      //获取项目下的节点
      getNode(){
        var que = {pro_id: this.proInfo._id}
        this.$post('node/find', {que: JSON.stringify(que)})
          .then( res => {
            if(res.data.length) {
              this.nodeList = res.data.sort((a, b) => {
                  return new Date(a.end_time) - new Date(b.end_time)
              })
            }
          })
          .catch( res => {console.log(res)})
      },
      viewNode(row){
        sessionStorage.setItem(this.$NODE_CACHE_NAME, JSON.stringify(row))
        this.$router.push({path: '/home/nodeDetail'})
      },
      proDone(){
        var pro = this.proInfo, status = pro.status
        switch (status) {
          case 1 : status = 3
            break
          case 2 : status = 4
            break
          default : computeStatus()
        }
        function computeStatus(){
          if(new Date(pro.end_time) >= Date.now()){
            status = 1
          } else {
            status = 2
          }
        }

        var que = JSON.stringify({_id: pro._id}), par = JSON.stringify({$set:{status}})
        this.$post('pro/updateStatus', {que, par})
          .then( res => {
            var data = res.data
            sessionStorage.setItem(this.$PRO_CACHE_NAME, JSON.stringify(data))
            this.init()
            this.$Message.success('修改成功')
          })
          .catch( res => {
            this.$Message.error('修改失败')
            console.log(res)
          })
      },
      proDelete(){
        var id = this.proInfo._id
        this.$post('pro/delete',{id})
          .then( res => {
            this.$Message.success("删除成功")
            setTimeout(() => this.$router.push('/home'), 1000)

          })
          .catch( err => { this.$Message.error('删除失败'); console.log(err)})
      },
      getHistory(){
        var id = this.proInfo._id
        this.$post('pro/getModifyRecords', {id})
          .then( res => {
            if(res.data.length){
              this.updateRecords = res.data
            }
          })
          .catch(err => {
            this.$Message.error('历史记录获取失败')
            console.log(err)
          })
      },
      modifyPro(flag) {
        var form = this.$refs['proForm']
        if(flag == 1){
          form.validate( valid =>{
            if(!valid) return
            //加工参数
            var id = this.proInfo._id, par = {}, par2 = {}
            var proInfo = this.proInfo, proForm = this.proForm
            for(var key in proForm){
              if(proForm[key]) {
                par[key] = proForm[key]
                par2[key] = proForm[key]
              } else {
                par2[key] = proInfo[key]
              }
            }
            //重新判断状态
            if (new Date(par2.start_time) > Date.now()) {
               par.status = par2.status = 0
            } else if(new Date(par2.end_time) >= Date.now()) {
              par.status = par2.status = 1
            } else {
              par.status = par2.status = 2
            }
            //参数序列化
            par = JSON.stringify(par)
            par2 = JSON.stringify(par2)
            //发送请求
            this.$post('pro/modifyPro',{id, par, par2})
              .then( res => {
                this.proInfo = res.data
                sessionStorage.setItem(this.$PRO_CACHE_NAME, JSON.stringify(res.data))
                this.$Message.success('修改成功')
                form.resetFields()
                this.getHistory()
              })
              .catch( err=> {
                this.$Message.error('修改失败'); console.log(err)})
          })
        }else {
          form.resetFields()
        }
      },
    },
    computed:{
      dateFormat(){return this.$dateFormat},
      statusText(){return this.$STATUS_TEXT},
      isDelete(){
        var result = {}, pro = this.proInfo, nodeList = this.nodeList
        if(pro.status > 0 ){
          result.text = (pro.status) > 2 ? '项目已完结' :'项目进行中'
          result.status = false
        } else if(nodeList.length > 0){
          result.text = '项目存在子节点'
          result.status = false
        } else {
          result.text = '无'
          result.status = true
        }
        return result
      },
      isFinish(){
        var result = {}, pro = this.proInfo, isBegin = (pro.status > 0)
        result.text = isBegin ? '无' : '项目未开始'
        result.status = isBegin
        result.finish = (pro.status > 2)
        return result
      },
      isUpdate(){
        var result = {}, pro = this.proInfo
        result.text = (pro.status > 2) ? '完结状态不可修改' : '无'
        result.status = (pro.status <= 2)
        return result
      },
      timeBox(){
        //开始时间不可大于子节点开始时间，结束时间不可小于子节点结束时间
        var result = {}, nodeList = this.nodeList
        if(nodeList.length){
          result.start_time = `不能大于子节点开始时间 ${this.dateFormat(nodeList[0].start_time, 'yyyy-mm-dd')}`
          result.end_time = `不能小于子节点结束时间 ${this.dateFormat(nodeList[nodeList.length - 1].end_time, 'yyyy-mm-dd')}`
        } else {
          result.start_time = result.end_time =  `不存在子节点,无限制`
        }
        return result
      },
    }
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
