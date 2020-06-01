<template>
  <div>
    <Divider class="divider" orientation="left">基本信息</Divider>
    <Card style="width: 100%;">
      <Row class="expand-row">
        <Col span="6">
        <b class="expand-key">节点名称:</b>
        <span class="expand-value">{{node.name}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">节点状态:</b>
        <span class="expand-value">{{statusText[node.status]}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">开始时间:</b>
        <span class="expand-value">{{dateFormat(node.start_time, 'yyyy-mm-dd')}}</span>
        </Col>
        <Col span="6">
        <b class="expand-key">结束时间: </b>
        <span class="expand-value">{{dateFormat(node.end_time, 'yyyy-mm-dd')}}</span>
        </Col>
      </Row>
      <div class="details">
        <b style="width: 65px;">节点简介:</b>
        <span class="expand-value">{{node.detail}}</span>
      </div>
    </Card>
    <Divider class="divider" orientation="left">限制条件</Divider>
    <Card style="width: 100%">
      <Row class="expand-row">
        <Col span="12">
        <b class="expand-key">开始时间:</b>
        <span class="expand-value" style="margin-right: 30px; color: red">{{startTime.text}}</span>
        <Button size="small" v-show="startTime.isPro" @click="viewPro(pro)">查看此项目</Button>
        <Button size="small" v-show="!startTime.isPro" @click="updateFirstAndLast(firstNode[0])">修改此节点</Button>
        </Col>
        <Col span="12">
        <b class="expand-key">结束时间: </b>
        <span class="expand-value" style="margin-right: 30px; color: red">{{endTime.text}}</span>
        <Button size="small" v-show="endTime.isPro" @click="viewPro(pro)">查看此项目</Button>
        <Button size="small" v-show="!endTime.isPro" @click="updateFirstAndLast(lastNode[0])">修改此节点</Button>
        </Col>
      </Row>
    </Card>
    <Card style="width: 100%">
      <Form :label-width="80" ref="form" :model="form" :rules="formRules" inline>
          <FormItem label="项目名称" style="width: 32%" prop="name">
            <Input size="small" v-model="form.name"  placeholder="输入项目名称"/>
          </FormItem>
          <FormItem class="timeStar" label="开始日期" style="width: 32%" prop="startTime">
            <DatePicker
              v-model="form.startTime"
              style="width:100%;"
              size="small"
              format="yyyy/MM/dd"
              type="date" placement="bottom-end"
              placeholder="输入开始时间"
              class="itemsWidth">
            </DatePicker>
          </FormItem>
          <FormItem label="结束日期" style="width: 32%" prop="endTime">
            <DatePicker
              v-model="form.endTime"
              style="width:100%;"
              size="small"
              format="yyyy/MM/dd"
              type="date" placement="bottom-end"
              placeholder="输入结束时间"
              class="itemsWidth">
            </DatePicker>
          </FormItem>
          <FormItem label="项目简介" style="width: 38%" prop="detail">
            <Input type="textarea" v-model="form.detail"/>
          </FormItem>
          <FormItem label="修改原因" style="width: 38%" prop="reason">
            <Input type="textarea" v-model="form.reason"/>
          </FormItem>
          <FormItem align="right">
          <Button size="small" style="margin-right:20px" @click="modifyCommit(1)">修改</Button>
          <Button size="small" @click="modifyCommit(0)">取消</Button>
        </FormItem>
        </Form>
    </Card>
  </div>
</template>

<script>
  export default {
    props: ['tab'],
    data () {
      var name = (rule, value, cb) => {
        if(!value) return cb()
        var que = JSON.stringify({name: value})
        this.$post('node/verifyName', {que})
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
        var form = this.form, pro = this.pro, firstNode = this.firstNode
        if(form.endTime && value > form.endTime){
          cb('开始时间不可大于结束时间')
        } else if(firstNode.length && value < new Date(firstNode[0].end_time)){
          cb('开始时间不可小于前置节点结束时间')
        } else if(value < new Date(pro.start_time)){
          cb('开始时间不可小于所属项目开始时间')
        } else {
          cb()
        }
      }
      var endTime = (rule, value, cb) => {
        if(!value) return cb()
        var form = this.form, pro = this.pro, lastNode = this.lastNode
        if(form.startTime && value < form.startTime){
          cb('结束时间不可小于开始时间')
        } else if(lastNode.length && value > new Date(lastNode[0].start_time)){
          cb('结束时间不可大于后置节点开始时间')
        } else if(value > new Date(pro.end_time)){
          cb('结束时间不可大于所属项目结束时间')
        } else {
          cb()
        }
      }
      return {
        pro: {},
        node: this.tab,
        firstNode:[],
        lastNode:[],
        form:{
          name:'',
          startTime: null,
          endTime: null,
          detail: '',
          reason: '',
        },
        formRules:{
          name:[{validator: name, trigger: 'blur'}],
          startTime:[{validator: startTime, trigger: 'blur'}],
          endTime:[{validator: endTime, trigger: 'blur'}],
          detail:[],
          reason: [{required: true, message:'请填写修改原因', trigger: 'blur'}]
        }
      }
    },
    created(){
      this.init()
    },
    methods: {
      init(){
        this.getProInfo()
        this.getFirstNodeInfo()
        this.getLastNodeInfo()
      },
      getProInfo(){
        var que = JSON.stringify({_id: this.node.pro_id})
        this.$post('pro/find', {que})
          .then( res => {
            if(res.data) {
              this.pro = res.data[0]
            }
          })
          .catch( res => {
            this.$Message.error('获取项目信息失败')
            console.log(res)
          })
      },
      getFirstNodeInfo(){
        //存在前置节点则获取前置节点
        if(this.node.first_node.length){
          var que = JSON.stringify({_id: this.node.first_node})
          this.$post('node/find', {que})
            .then(res => {
              if(res.data) {
                this.firstNode = res.data.sort( (a, b) => {
                  new Date(b.end_time) - new Date(a.end_time)
                })
              }
            })
            .catch( res => {
              this.$Message.error('获取前置节点')
              console.log(res)
            })
        }
      },
      getLastNodeInfo(){
        if(this.node.last_node.length){
          var que = JSON.stringify({_id: this.node.last_node})
          this.$post('node/find', {que})
            .then( res => {
              if(res.data) {
                this.lastNode = res.data.sort( (a, b) => {
                  new Date(a.start_time) - new Date(b.start_time)
                })
              }
            })
            .catch( res => {
              this.$Message.error('获取后置节点失败')
              console.log(res)
            })
        }
      },
      viewPro(pro){
        sessionStorage.setItem(this.$PRO_CACHE_NAME, JSON.stringify(pro))
        this.$router.push({path: 'proDetail'})
      },
      updateFirstAndLast(node){
        this.$emit('createTab', node)
      },
      modifyCommit(flag){
        var form = this.$refs['form']
        if (flag) {
          form.validate(valid => {
            if (valid) {
              commit.call(this).then(()=>{
                setTimeout(function(){
                  form.resetFields()
                },0)
              })
            }
          })
        } else {
          form.resetFields()
        }
        function commit () {
          var form = this.form, node = this.node, que = {_id: node._id}, par = {}, par2 = {}, flag = false
          //验证是否有进行修改且加工参数
          for (var key in form) {
            switch (key) {
              case 'name' : {
                if (form[key]) {
                  par.name = form[key]
                  par2.name = form[key]
                  flag = true
                } else {
                  par2.name = node.name
                }
              }
                break
              case 'startTime' : {
                if (form[key]) {
                  par.start_time = form[key]; par2.start_time = form[key]; flag = true
                } else {
                  par2.start_time = node.start_time
                }
              }
                break
              case 'endTime' : {
                if (form[key]) {
                  par.end_time = form[key]; par2.end_time = form[key]; flag = true
                } else {
                  par2.end_time = node.end_time
                }
              }
                break
              case 'detail' : {
                if (form[key]) {
                  par.detail = form[key]; par2.detail = form[key]; flag = true
                } else {
                  par2.detail = node.detail
                }
              }
                break
              default:{
                var status  = computeStatus(new Date(par2.start_time), new Date(par2.end_time))
                function computeStatus(start, end) {
                  var status = 0
                  if(start <= Date.now()){
                    status = 1
                  } else if(end < Date.now()){
                    status = 2
                  }
                  return status
                }
                par.status = par2.status = status; par2.belong_id = node._id ; par2.reason = form.reason;
              }
            }
          }
          if(flag) {
              return this.$post('node/update',{
                que: JSON.stringify(que),
                par: JSON.stringify({$set: par}),
                par2: JSON.stringify(par2)
              }).then( res => {
                  if(res.data){
                    sessionStorage.setItem(this.$NODE_CACHE_NAME, JSON.stringify(res.data))
                    this.$router.push({path: 'nodeDetail'})
                  }
              }).catch( res => {
                this.$Message.error('修改失败')
                console.log(res)
              })
          } else {
            this.$Message.info('未进行任何修改')
          }
        }
      }
    },
    computed: {
      statusText(){
        return this.$STATUS_TEXT
      },
      dateFormat(){
        return this.$dateFormat
      },
      startTime(){
        //开始时间不可小于前置节点结束时间，不可小于项目开始时间
        var result = {}, firstNode = this.firstNode
        if(firstNode.length){
          result.isPro = false
          result.text = `不能小于前置节点结束时间 ${this.dateFormat(firstNode[0].end_time, 'yyyy-mm-dd')}`
        } else {
          result.isPro = true
          result.text = `不能小于项目开始时间 ${this.dateFormat(this.pro.start_time, 'yyyy-mm-dd')}`
        }
        return result
      },
      endTime(){
        //结束时间不可大于后置节点开始时间，不可大于项目结束时间
        var result = {}, lastNode = this.lastNode
        if(lastNode.length){
          result.isPro = false
          result.text = `不能大于后置节点开始时间 ${this.dateFormat(lastNode[0].start_time, 'yyyy-mm-dd')}`

        } else {
          result.isPro = true
          result.text = `不能大于项目结束时间 ${this.dateFormat(this.pro.end_time, 'yyyy-mm-dd')}`
        }
        return result
      }
    },
  }
</script>

<style scoped>
  .details{
    display: flex;
    display: -webkit-flex;
  }
  .expand-value{
    padding-left: 10px;
  }
  .expand-row{
    margin-bottom: 16px;
  }
</style>
