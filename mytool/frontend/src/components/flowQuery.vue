<template>
  <div>
    <Collapse v-model="openPanel">
      <Panel name="1">
        号码查询
        <div slot="content">
        <Form ref="form" :model="form"
              :label-width="70" inline style="display: flex; justify-content: space-between">
          <FormItem label="楼层">
            <Input type="text" size="small" v-model="form.floor" placeholder="楼层查询">
            </Input>
          </FormItem>
          <FormItem label="店铺名称">
            <Input type="text" size="small" v-model="form.shopName" placeholder="店铺名称查询">
            </Input>
          </FormItem>
          <FormItem label="操作">
            <Button size="small"
                    @click="formHandle(true)"
                    style="margin-right: 10px">查询</Button>
          </FormItem>
        </Form>
        </div>
      </Panel>
      <Panel name="2">
        号码列表
        <div slot="content">
        <div style="display:flex; justify-content: space-between; margin-bottom: 10px">
          <Button size="small" style="margin-right: 50px"
                  @click="loadTemplate">下载模板</Button>
          <input style="display: none" type="file" ref="phoneFile">
          <Button size="small" style="margin-right: 50px" @click="importPhoneNumber">
            导入号码簿</Button>
          <Button size="small"
                  @click="deletePhone"
                  style="margin-right: 50px">删除选中号码</Button>
          <Button size="small" @click="exportData">导出选中号码流量数据</Button>
        </div>
        <Table @on-selection-change="tableSelection"
               :columns="columns"
               :data="data"></Table>
        </div>
      </Panel>
    </Collapse>
    <Modal v-model="dialogShow" :mask-closable="false"
           title="加载进度">
      <Progress :percent="percent" />
      <div slot="footer">
        <Button size="large" :disabled="isLoading" @click="loadExcel">下载</Button>
      </div>
    </Modal>
    <Modal v-model="importPhoneDialog" :mask-closable="false"
           title="上传进度">
      <Progress :percent="percent2" />
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
    export default {
        data () {
            return {
              openPanel: [2],
              form:{
                floor: '',
                shopName: '',
              },
              columns: [
                {
                  type: 'selection',
                  width: 60,
                  align: 'center'
                },
                {
                  title: '楼层',
                  key: 'floor'
                },
                {
                  title: '店铺名称',
                  key: 'shopName'
                },
                {
                  title: 'MAC',
                  key: 'mac'
                },
                {
                  title: '电话号码',
                  key: 'phone'
                }
              ],
              data: [],
              selectedList: [],
              dialogShow: false,
              importPhoneDialog: false,
              course: 0,
              course2: 0,
              flowData: [],
              phoneList: []
            }
        },
        created () {
          this.getPhoneList()
        },
        methods: {
          tableSelection(selection){
            this.selectedList = selection
          },
          isSelectedPhone() {
            if (this.selectedList.length)  return true
            this.$Message.error('未选中任何店铺信息')
          },
          formHandle(){
            var que = {}, form = this.form
            for (var key in form){
              if(!form[key]) continue
              que[key] = {$regex: form[key], $options: 'i'}
            }
            this.$post('phone/find', {que: JSON.stringify(que)})
              .then( res => {
                this.data = res.data
              })
              .catch( res =>{ console.log(res)})
          },
          deletePhone(){
            if(!this.isSelectedPhone()) return
            this.$Modal.confirm({
              title: '是否删除选中的店铺信息,删除不可恢复, 请谨慎操作！',
              okText: '删除',
              cancelText: '取消',
              onOk: () => {
                var iccid = this.selectedList.map(i => i._id )
                var query = {_id:{$in: iccid}}
                this.$post('phone/delete',{query: JSON.stringify(query)})
                  .then( res => {
                    this.$Message.success('删除成功');
                    this.getPhoneList()
                  })
                  .catch( res => {
                    this.$Message.error('删除失败')
                    console.log(res)
                  })
              }
            })
          },
          exportData(){
            if(!this.isSelectedPhone()) return
            this.course = 0;
            this.dialogShow = true;
            var index = 0 , flowData = []
            getDate.call(this, this.selectedList[index].phone)
            function getDate(phoneNumber){
              var params = {
                iccid: phoneNumber,
                url: this.$DATA_SITE
              }
              this.$post('phone/flowQuery', params).then( res =>{
                mapData.call(this, res.data)
                this.course = ++index
                if(index < this.selectedList.length){
                  getDate.call(this, this.selectedList[index].phone)
                } else {
                  this.flowData = flowData
                }
              }, res => {
                  this.$Message.error(res)
              })
            }
            function mapData(html){
              //获取剩余量数据
              var str1 = '\<div class\=\"progress_bd\"\>\<font style\=\"color\:#0088cc\;font-size\:16px\;\"\>'
              var reg1 = new RegExp(str1)
              var index1 = html.search(reg1)
              var result1 = html.substr(index1 + str1.length, 40).match(/\d*\.\d*/g)
              //获取期限
              var str2 = '有效期：'
              var reg2 = new RegExp(str2)
              var index2 = html.search(reg2)
              var result2 = html.substr(index2 + str2.length, 50).replace(/\s/g, '').split('至')
              //加工数据插入数据集合
              var selectedObj = this.selectedList[index]
              var obj = {
                  '楼层': selectedObj.floor,
                  '店铺名称': selectedObj.shopName,
                  'MAC地址': selectedObj.mac,
                  '电话号码': selectedObj.phone,
                  '开始时间': result2[0],
                  '结束时间': result2[1],
                  '已用流量(M)': result1[0],
                  '剩余流量(M)': (result1[1] - result1[0]).toString()
              }
              flowData.push(obj)
            }
          },
          loadExcel(){
            this.$exportExcel(this.flowData, this.$FILE_NAME)
            this.dialogShow = false
            this.course = 0
          },
          getPhoneList(){
            this.$post('phone/find')
              .then( res => {
                this.data = res.data
              })
              .catch( res =>{ console.log(res)})
          },
          loadTemplate(){
            var template = [{'楼层': '', '店铺名称':'', 'MAC':'', '电话号码': ''}]
            this.$exportExcel(template, '号码簿模板')
          },
          importPhoneNumber(){
              var input = this.$refs['phoneFile']
              input.onchange = this.inputChange
              input.click()

          },
          inputChange(ev){
            var files = ev.target.files[0]
            var reg = /\.xls|xlsx$/
            if(!reg.test(files.name)) return this.$Message.error('只能导入Excel格式文件')
            var fileReader = new FileReader
            fileReader.onload = ev => {
              var data = ev.target.result, fromTo = '', persons = []
              var workbook = XLSX.read(data, {type: 'binary'})
              for (var sheet in workbook.Sheets) {
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                  fromTo = workbook.Sheets[sheet]['!ref'];
                  persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                  // break; // 如果只取第一张表，就取消注释这行
                }
              }
              if(persons.length == 1 && persons[0]['电话号码'] == ''){
                return this.$Message.error('没有识别到任何数据')
              } else {
                this.phoneList = persons
              }
              this.$Modal.confirm({
                title: 'Excel解析完毕, 确认是否上传！',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                  this.commitPhoneNumber()
                }
              })
            }
            fileReader.readAsBinaryString(files)
          },
          commitPhoneNumber(){
            this.importPhoneDialog = true
            var commit = ()=>{
              var par = {
                floor: this.phoneList[this.course2]['楼层'],
                shopName: this.phoneList[this.course2]['店铺名称'],
                mac: this.phoneList[this.course2]['MAC'],
                phone: this.phoneList[this.course2]['电话号码']
              }
              this.$post('phone/create', {par: JSON.stringify(par)})
                .then( res =>{
                  if(++this.course2 < this.phoneList.length) return commit()
                  this.getPhoneList()
                  this.course2 = 0
                  this.importPhoneDialog = false
                })
                .catch( res => console.log(res))
            }
            commit()
          }
        },
        computed:{
          isLoading(){
              return this.course < this.selectedList.length
          },
          percent(){
            return Math.round(this.course / this.selectedList.length * 100)
          },
          percent2(){
            return Math.round(this.course2 / this.phoneList.length * 100)
          }
        }
    }
</script>

<style scoped>

</style>
