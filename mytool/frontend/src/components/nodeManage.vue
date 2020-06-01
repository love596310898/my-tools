<template>
  <Collapse v-model="openPanel">
    <Panel name="1">
      节点查询
      <div slot="content">
      <Form id="find" :label-width="80" :model="findQuery" inline>
        <FormItem label="所属项目" >
          <Select size="small" class="itemsWidth" v-model="findQuery.pro" @on-change="proSelect">
            <Option v-for="i in proList" :key="i._id" :value="i._id">{{i.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="所属任务" >
          <Select size="small" class="itemsWidth" v-model="findQuery.task">
            <Option v-for="i in (selectedPro ? selectedPro.task : [])" :key="i._id" :value="i._id">{{i.name}}</Option>
          </Select>
        </FormItem>
        <FormItem :labelWidth="0" style="width: 30%; text-align: center">
          <Button size="small" style="margin-right: 10px" @click="findNode">查询</Button>
        </FormItem>
      </Form>
    </div>
    </Panel>
    <Panel name="2" id="table">
      节点列表
      <div slot="content">
      <Table :columns="nodeColumns" :data="nodeList" @on-selection-change="selectNode">
        <template slot-scope="{row}" slot="operate">
          <Button size="small" @click="viewNodeDetail(row)">查看详情</Button>
        </template>
      </Table>
    </div>
    </Panel>
    <Panel name="3">
      创建节点
      <div slot="content">
      <Form :label-width="80" inline ref="nodeForm"
            :model="nodeForm" :rules="nodeFormRules">
        <FormItem label="节点名称" prop="name">
          <Input size="small"  placeholder="请输入项目名称"
                 v-model="nodeForm.name"/>
        </FormItem>
        <FormItem class="timeStar" label="开始日期" prop="start_time">
          <DatePicker
            v-model="nodeForm.start_time"
            size="small"
            format="yyyy/MM/dd"
            placement="bottom-end"
            placeholder="请输入开始时间"
            class="itemsWidth">
          </DatePicker>
        </FormItem>
        <FormItem label="结束日期" prop="end_time">
          <DatePicker
            size="small"
            v-model="nodeForm.end_time"
            format="yyyy/MM/dd"
            placement="bottom-end"
            placeholder="请输入结束时间"
            class="itemsWidth">
          </DatePicker>
        </FormItem>
        <FormItem label="前置节点" prop="isPre">
          <i-switch size="large" v-model="nodeForm.isPre">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
        </FormItem>
        <FormItem label="节点简述"style="width: 78%" prop="detail">
          <Input size="small" type="textarea" v-model="nodeForm.detail"/>
        </FormItem>
        <FormItem >
          <Button size="small" style="margin-right: 10px" @click="nodeFormCommit(1)">提交</Button>
          <Button size="small"  @click="nodeFormCommit(0)">取消</Button>
        </FormItem>
      </Form>
    </div>
    </Panel>
  </Collapse>
</template>
<script>
  import expandRow from './tableExpand.vue'
  export default {
    data () {
      var isSelectPro = findQuery => findQuery.pro && findQuery.task
      var dateFormat = this.$dateFormat
      var startTime = (rule, value, cb) => {
        if(!isSelectPro(this.findQuery)) {
          return cb('请先选择项目和任务')
        }
        if(this.nodeForm.isPre && this.selectedNodeList.length){
          var preNode = this.selectedNodeList[0], preTime = new Date(preNode.end_time)
          if(value < preTime) {
            return cb(`不能小于前置结束时间${dateFormat(preTime, 'yyyy-mm-dd')}`)
          }
        }
        var pro = this.selectedPro
        var startTime = new Date(pro.start_time), endTime = new Date(pro.end_time)
        if(value < startTime){
          cb(`不能小于项目开始时间${dateFormat(startTime, 'yyyy-mm-dd')}`)
        } else if(value > endTime){
          cb(`不能大于项目结束时间${dateFormat(endTime, 'yyyy-mm-dd')}`)
        } else if(this.nodeForm.end_time && value > this.nodeForm.end_time){
          cb(`不能大于节点结束时间${dateFormat(this.nodeForm.end_time, 'yyyy-mm-dd')}`)
        } else {
          cb()
        }
      }
      var endTime = (rule, value, cb) => {
        if(!isSelectPro(this.findQuery)) {
          return cb('请先选择项目和任务')
        }
        var pro = this.selectedPro, endTime = new Date(pro.end_time)
        if(value > endTime) {
          cb(`不能大于项目结束时间${dateFormat(endTime, 'yyyy-mm-dd')}`)
        } else if(this.nodeForm.start_time && value < this.nodeForm.start_time){
          cb(`不能小于节点开始时间${dateFormat(this.nodeForm.start_time, 'yyyy-mm-dd')}`)
        } else {
          cb()
        }
      }
      return {
        openPanel: [1,2,3],
        findQuery: {
          pro: '',
          task: ''
        },
        proList:[],
        selectedPro: null,
        nodeColumns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
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
        selectedNodeList: [],
        nodeForm:{
          name: '',
          start_time: '',
          end_time: '',
          isPre: false,
          detail: ''
        },
        nodeFormRules:{
          name:[{required: true, message: '请输入节点名称'}],
          start_time:[{required: true, message: '请输入开始时间'},
            {validator: startTime, trigger: 'blur'}],
          end_time:[{required: true, message: '请输入结束时间'},
            {validator: endTime, trigger: 'blur'}],
          detail:[{required: true, message: '请输入节点简介'}]
        }
      }
    },
    created(){
      this.getProList()
    },
    methods: {
      getProList(){
        this.$post('pro/getProAndTask')
          .then( res => {
            this.proList = res.data
          })
          .catch( res => {
            this.$Message.error('获取项目数据失败')
            console.log(res)
          })
      },
      proSelect(value){
        this.selectedPro = this.proList.filter( pro => pro._id == value)[0]
      },
      nodeFormCommit(flag){
        var form = this.$refs['nodeForm']
        if(flag){
          form.validate( valid => {
            if(!valid) return
            var task = this.selectedPro.task.filter( task => task._id == this.findQuery.task)[0]
            var nodePar = {pro_id: this.selectedPro._id, task_id: task._id}
            var taskPar = {}, taskQuery = {_id: task._id}
            var startTime = task.start_time, endTime = task.end_time
            for (var key in this.nodeForm){
              switch (key) {
                case 'isPre':
                  //是否有前置节点
                  if(this.nodeForm[key] && this.selectedNodeList.length){
                    this.selectedNodeList.forEach( item => {
                      if(!nodePar.first_node) nodePar.first_node = []
                      nodePar.first_node.push(item._id)
                    })
                  }
                  break
                case 'start_time':
                  //确认是否跟新任务开始时间
                  if(!startTime || this.nodeForm.start_time < new Date(startTime)){
                    taskPar[key] = this.nodeForm[key]
                  }
                  nodePar[key] = this.nodeForm[key]
                  nodePar.status = Number(this.nodeForm.start_time < new Date())
                  break
                case 'end_time':
                  //确认是否更新任务结束时间
                  if(!endTime || this.nodeForm.end_time > new Date(endTime) ){
                    taskPar[key] = taskPar[key] = this.nodeForm[key]
                  }
                  nodePar[key] = this.nodeForm[key]
                  break
                default: nodePar[key] = this.nodeForm[key]
              }
            }

            this.$post('node/create', {
              nodePar: JSON.stringify(nodePar),
              taskPar: JSON.stringify(taskPar),
              taskQuery: JSON.stringify(taskQuery)
            }).then( res => {
               this.$Message.success('创建成功')
               form.resetFields()
            }).catch( res => {
              this.$Message.error('创建失败')
              console.log(res)
            })
          })
        } else {
          form.resetFields()
        }
      },
      findNode(){
        if(!this.findQuery.task || !this.findQuery.pro) return this.$Message.error('请先选择查询条件')
        var que = JSON.stringify({pro_id: this.findQuery.pro, task_id: this.findQuery.task})
        this.$post('node/find',{que})
          .then( res => {
            if(res.data.length) {
              this.nodeList = res.data
            } else {
              this.$Message.info('该项目或任务下没有节点')
            }
          })
          .catch( res => {
            this.$Message.error('查询节点失败')
            console.log(res)
          })
      },
      selectNode(selectedNodeList){
        this.selectedNodeList = selectedNodeList
        this.selectedNodeList.sort( (a, b) => {
          return new Date(b.end_time) - new Date(a.end_time)
        })
      },
      viewNodeDetail(node){
        sessionStorage.setItem(this.$NODE_CACHE_NAME, JSON.stringify(node))
        this.$router.push({path:'nodeDetail'})
      }
    },
    computed: {
      dateFormat(){return this.$dateFormat},
      statusText(){return this.$STATUS_TEXT}
    }
  }
</script>

<style scoped>
  #find{
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
  }
  .itemsWidth{
    width: 200px;
  }
  #table .ivu-collapse-content{
    padding: 0;
  }
  #table .ivu-collapse-content .ivu-collapse-content-box {
    padding-top: 0;
    padding-bottom: 0;
  }
</style>
