<template>
  <Collapse v-model="openPanel">
      <Panel name="1">
        项目查询
        <div slot="content">
        <Form id="find" :label-width="80" :model="findQuery" inline>
          <FormItem label="名称查询" >
            <Input size="small" class="itemsWidth" type="text" v-model="findQuery.name"/>
          </FormItem>
          <FormItem class="timeStar" label="开始日期" >
            <DatePicker
              v-model="findQuery.start_time"
              size="small"
              format="yyyy/MM/dd"
              type="daterange" placement="bottom-end"
              placeholder="Select date"
              class="itemsWidth">
            </DatePicker>
          </FormItem>
          <FormItem label="结束日期">
            <DatePicker
              v-model="findQuery.end_time"
              size="small"
              format="yyyy/MM/dd"
              type="daterange" placement="bottom-end"
              placeholder="Select date"
              class="itemsWidth">
            </DatePicker>
          </FormItem>
          <FormItem :labelWidth="0" style="width: 30%; text-align: center">
            <Button size="small" style="margin-right: 10px" @click="proQuery">查询</Button>
          </FormItem>
        </Form>
      </div>
      </Panel>
      <Panel name="2" id="table">
        项目列表
        <div slot="content">
        <Table :columns="proColumns" :data="proList">
          <template slot-scope="{row}" slot="operate">
            <Button size="small" @click="proDetails(row)">查看详情</Button>
          </template>
        </Table>
      </div>
      </Panel>
      <Panel name="3">
        创建项目
        <div slot="content" id="create">
        <Form :label-width="80" inline
              ref="createProForm"
              :model="createProForm" :rules="createProFormRules">
          <FormItem label="项目名称" prop="name">
            <Input size="small" v-model="createProForm.name"  placeholder="请输入项目名称"/>
          </FormItem>
          <FormItem class="timeStar" label="开始日期" prop="start_time">
            <DatePicker
              v-model="createProForm.start_time"
              size="small"
              format="yyyy/MM/dd"
              placement="bottom-end"
              placeholder="开始时间"
              class="itemsWidth">
            </DatePicker>
          </FormItem>
          <FormItem label="结束日期" prop="end_time">
            <DatePicker
              v-model="createProForm.end_time"
              size="small"
              format="yyyy/MM/dd"
              placement="bottom-end"
              placeholder="结束时间"
              class="itemsWidth">
            </DatePicker>
          </FormItem>
          <FormItem label="项目简述"style="width: 96%" prop="detail">
            <Input size="small" v-model="createProForm.detail" type="textarea" placeholder="项目简述"/>
          </FormItem>
        </Form>
        <div style="width: 30%; text-align: center; padding-left: 12px">
          <Button size="small" style="margin-right: 10px" @click="createPro(true)">提交</Button>
          <Button size="small" @click="createPro(false)">取消</Button>
        </div>
      </div>
      </Panel>
    </Collapse>
</template>
<script>
  import expandRow from './tableExpand.vue'
  export default {
    data () {
      const time_validate = (rule, value, cb) =>{
        var start = this.createProForm.start_time
        var end = this.createProForm.end_time
        if(start == '' || end == '') return
        if( start >= end ){
          cb('开始时间不能大于等于结束时间')
        } else {
          cb()
        }
      }
      return {
        openPanel: [1,2,3],
        findQuery: {
          name:'',
          start_time: null,
          end_time: null,
        },
        proColumns: [
          {
            type: 'expand',
            width: 80,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  row: params.row,
                  title: '项目简介'
                }
              })
            }
          },
          {
            title: '项目名称',
            key: 'name'
          },
          {
            title: '开始时间',
            render: (h, params) => {
              var dateText = this.$dateFormat(params.row.start_time, 'yyyy-mm-dd')
              return h('span', dateText)
            }
          },
          {
            title: '结束时间',
            render: (h, params) => {
            var dateText = this.$dateFormat(params.row.end_time, 'yyyy-mm-dd')
               return h('span', dateText)
            }
          },
          {
            title: '状态',
            key: 'status',
            render: (h, params) =>{
              var text = this.$STATUS_TEXT[params.row.status]
              return h('span', text)
            }
          },
          {
            title: '操作',
            slot: 'operate',
            width: 150,
            align: "center"
          }
        ],
        proList: [],
        createProForm:{
          name: '',
          start_time: '',
          end_time: '',
          detail: '',
        },
        createProFormRules:{
          name: [
            {required: true, message: '请填写项目名称'}
          ],
          start_time:[
            {required: true, message: '请选择开始时间'},
            {validator: time_validate,}
          ],
          end_time:[
            {required: true, message: '请选择结束时间'},
            {validator: time_validate,}
          ],
          detail:[
            {required: true, message: '请填写项目描述'}
          ],
        }
      }
    },
    methods: {
      //创建项目
      createPro(isCommit){
        var form = this.$refs.createProForm
        if(isCommit){
          form.validate( valid => {
            if(valid){
              this.proStatus()
              this.$post('pro/create', {par: JSON.stringify(this.createProForm)})
                .then( res => {
                  this.$Message.success('创建成功')
                  setTimeout(()=>{form.resetFields()}, 0)
                })
                .catch( err => {
                  this.$Message.error('创建失败')
                  console.log(err)
                })
            }
          })
        } else {
          form.resetFields()
        }
      },
      //设置项目状态
      proStatus (){
        var start = this.createProForm.start_time
        this.createProForm.status = Number(start <= Date.now())
      },
      //获取项目
      proQuery(){
        var form = this.findQuery, que = {$and:[]}
        Object.keys(form).map( key => {
          switch (key){
            case 'name':
              if(form[key]){
                que.$and.push({
                  name:{$regex: form[key], $options: 'i'}
                })
              }
              break
            default:
              if(form[key] && form[key][0] && form[key][1]){
                que.$and.push({
                  $and:[{[key]:{$gte: form[key][0]}}, {[key]:{$lte: form[key][1]}}]
                })
              }
          }
        })
        if(!que.$and.length) que = {}
        this.$post('pro/find', {que: JSON.stringify(que)}).then( res => {
          if(res.data.length) {
            this.proList = res.data
          } else {
            this.$Message.info('未查询到任何项目,请检查条件输入是否正确！')
          }
        }).catch( err => {
          this.$Message.error('查询失败')
          console.log(err)
        })
      },
      //项目详情
      proDetails(row){
        sessionStorage.setItem(this.$PRO_CACHE_NAME, JSON.stringify(row))
        this.$router.push({path: 'home/proDetail'})
      }
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
  #create{
    display: flex;
    display: -webkit-flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
