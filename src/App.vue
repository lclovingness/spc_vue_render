<template>
  <div id="app">
    <div class="titlelay">
      <div class="titleinner" id="titleinner">
        　SPC实时数据状态图
      </div>
    </div>

    <div class="tempHinterLayer" id="tempHinterLayer">
      <div class="tempHinterInner">
        　（暂时没有收到数据发送）
      </div>
    </div>

    <div id="container" class="m-huabu">
      <div id="sonTitle" v-show="!initFirstFlag">
        <span style="margin-right:15px;display: inline-block"><Button type="success" @click="pauseReceiveWebSocketDataHandler">{{ifAcceptRealtimeDataStr}}</Button></span>
        <span class="m-selectBoxes">当前图表显示：

        <Select v-model="currentViewFeaturesList" multiple style="max-width:350px;width:auto;text-align:left"
                @on-change="echoSelectChangedHandler"
                ref ="mySelectEntity">
          <Option v-for="(item,index) in spcFeaturesAddAllOptionArr" :value="item" :key="item">{{
            item }}</Option>
        </Select>
（可多选）
        </span>

        <span style="display: inline-block">同时显示数据点的数量：
        <Input v-model="showAtTheSameTimeSpotNums" style="width: 40px"
               @on-focus="selectHighlightInputContent"></Input> 个
        <Button size="default" type="primary" class="m-updateNumBtn" @click="readyForUpdateNumValue">点击更新</Button>
        </span>
        <span class="m-outputPrint" id="outputE" @mouseenter="xddddd" @mouseleave="yddddd"><Button size="small" type="primary" @click="decideIFPrintInControllPanel()" >{{ifPrintRealTimeDataToControllPanel}}</Button></span>
      </div>
      <div v-for="(item,index) in spcFeaturesArr">
        <hr style="margin-top:20px;margin-bottom:20px;height:1px;border:none;border-top:1px ridge gray;" v-show="!initFirstFlag"/>
        <br>
        <div :id="'chart_'+index" class="m-spcChart"></div>
        <div v-show="chartWholeShowFlag" class="m-addtionalControllBar">
          <span class="m-ca-cp-cpk-label">
            <span class="u-onec-label">Ca: {{latestAllCa[transferRealIndex(item)]}}</span>
            <span class="u-onec-label">Cp: {{latestAllCp[transferRealIndex(item)]}}</span>
            <span class="u-onec-label">Cpk: {{latestAllCpk[transferRealIndex(item)]}}</span>
          </span>
          <span class="m-usl-lsl-label">
                自定义 —— LSL: <Input v-model="user_all_lsls[transferRealIndex(item)].num" style="width: 60px;margin-right:20px"
                                   @on-focus="selectHighlightInputContent" number></Input>USL:
            <Input v-model="user_all_usls[transferRealIndex(item)].num" style="width: 60px;margin-right:20px" @on-focus="selectHighlightInputContent" number></Input>
            LCL:
            <Input v-model="user_all_lcls[transferRealIndex(item)].num" style="width: 60px;margin-right:20px"
                   @on-focus="selectHighlightInputContent" number></Input>
            UCL:
            <Input v-model="user_all_ucls[transferRealIndex(item)].num" style="width: 60px" @on-focus="selectHighlightInputContent" number></Input>
              <Button
                size="default" type="primary" class="m-updateUSLAndLSLBtn" @click="echoUSLAndSoOnParasChanged(transferRealIndex(item))">
                点击更新
              </Button>
          </span>
        </div>
        <br>
        <br>
      </div>
      <br>
      <br>
      <Modal
        v-model="ifNeedShowAllFeaturesFlag"
        width="600"
        title='温馨提示'
        closable
        class="vertical-center-modal"
        @on-ok="ok_for_show_all_features"
        @on-cancel="cancel_for_show_all_features"
      >
        <p class="u-besuredelsty">当前所有Feature加起来的数量是 {{bak_spcFeaturesArr.length}} 个，如果同时显示实时数据状态图，会严重消耗电脑的CPU资源，可能导致页面变卡变慢，请知悉。<br><br>
        您果真确定要同时显示 {{bak_spcFeaturesArr.length}} 个Feature的SPC实时数据状态图吗？
        </p>
      </Modal>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts';

  export default {
    name: 'App',

    props: [],

    data() {
      return {
        aa:{
          bb:5
        },
        abc:[
          {fn:11},
          {fn:22}

        ],
        ifAcceptRealtimeDataStr:'暂停接收',
        acceptRealtimeDataFlag:true,
        ifPrintRealTimeDataToControllPanel:'输出到控制台',
        printRealTimeToControllPanelFlag:false,
        w2:'123',
        spcFeaturesAddAllOptionArr:[],
        currentViewFeaturesList:'',
        ws: null,
        myChart: null,
        spcFeaturesArr: [],
        showAtTheSameTimeSpotNums: 0,
        current_showAtTheSameTimeSpotNums:0,
        chartIndex: 0,
        latestAllDateTimeArr: [],
        latestAllDataArr: [],
        latestAllCa: [],
        latestAllCp: [],
        latestAllCpk: [],
        user_all_usls: [],
        user_all_lsls: [],
        user_all_means: [],
        user_all_sigmas: [],
        chartLeftMarginBlankWidth: 70,
        chartRightMarginBlankWidth: 150,
        simulateDemoFlag: false,
        chartWholeShowFlag: false,
        houxuanColors: [],
        bak_spcFeaturesArr:[],
        initFirstFlag:true,
        defaultLabel:'—— All Features ——',
        user_all_lcls:[],
        user_all_ucls:[],
        old_user_all_lcls:[],
        old_user_all_ucls:[],
        usl_happen_changed_flag:false,
        lsl_happen_changed_flag:false,
        old_user_all_lsls:[],
        old_user_all_usls:[],
        cycle_send_action_id:null,
        allDeviceNames:[],
        availableArr:[],
        recentRT:null,
        ifNeedShowAllFeaturesFlag:false,
        bak_currentViewFeaturesList:[]
      }
    },
    watch: {
      currentViewFeaturesList(val, oldVal) {
        this.renewDrawCharts();
      },

      user_all_usls(val, oldVal) {
        this.usl_happen_changed_flag = true;
      },
      user_all_lsls(val, oldVal) {
        this.lsl_happen_changed_flag = true;
      }
    },
    mounted: function () {

      let host = window.location.host;

      let wsServer = 'ws://' + host + '/';

      console.log("WebSocket Server URL: " + wsServer);

      let Socket = 'MozWebSocket' in window ? MozWebSocket : WebSocket;

      let ownerparent = this;

      if (host.indexOf("localhost:") > -1 || host === '') {
        this.ws = new Object();
        this.ws.send = function () {
        }
        //this.simulateDemoFlag = true;

        this.ws = new Socket('ws://test1.yeseer.cn/');
        //this.ws = new Socket('ws://lcspcgw001.neuseer.cn/');
        //this.ws = new Socket('ws://lcspc01.neuseer.cn/');
      } else {
        this.ws = new Socket(wsServer);
      }

      this.ws.onerror = function (evt) {
        console.log("Error: "+evt);
      }

      this.ws.onmessage = function (evt) {
        ownerparent.updateReceivedData(evt.data);
      };

      this.ws.onopen = function () {

        console.log('WebSocket Connected OK');

        ownerparent.execInitSendAction();

        ownerparent.cycle_send_action_id = setInterval(ownerparent.execInitSendAction,1000);

      };

      window.onresize = this.rearrangeShowElementsByWindowResize;

      this.houxuanColors = [];
      this.houxuanColors[0] = '#008000';
      this.houxuanColors[1] = '#FFA500';
      this.houxuanColors[2] = '#FF4500';
      this.houxuanColors[3] = '#9400D3';
      this.houxuanColors[4] = '#7B68EE';
      this.houxuanColors[5] = '#008B8B';
      this.houxuanColors[6] = '#8B4513';
      this.houxuanColors[7] = '#0887FF';
      this.houxuanColors[8] = '#808000';
      this.houxuanColors[9] = '#8B0000';
      this.houxuanColors[10] = '#5F9EA0';

      var arr = this.houxuanColors.map(function (item) {
        return item;
      });

      //this.houxuanColors = this.houxuanColors.concat(arr);
      //
      // this.spcFeaturesAddAllOptionArr = [this.defaultLabel];
      //
      // this.currentViewFeaturesList = [this.defaultLabel];

      this.spcFeaturesArr = [];

      this.allDeviceNames = [];

      this.recentRT = null;

    },

    methods: {

      xddddd(){
        document.getElementById("outputE").style.opacity = 1;
      },

      yddddd(){
        document.getElementById("outputE").style.opacity = 0;
      },

      decideIFPrintInControllPanel(){
        if(this.ifPrintRealTimeDataToControllPanel == '输出到控制台')
        {

          this.ifPrintRealTimeDataToControllPanel = '不输出到控制台';
          this.printRealTimeToControllPanelFlag = true;

        } else {

          this.ifPrintRealTimeDataToControllPanel = '输出到控制台';
          this.printRealTimeToControllPanelFlag = false;
        }
      },

      pauseReceiveWebSocketDataHandler()
      {
        if(this.ifAcceptRealtimeDataStr == '暂停接收')
        {

          this.ifAcceptRealtimeDataStr = '恢复接收';
          this.acceptRealtimeDataFlag = false;

        } else {

          this.ifAcceptRealtimeDataStr = '暂停接收';
          this.acceptRealtimeDataFlag = true;
        }
      },

      echoChangedForNum()
      {
        if(this.initFirstFlag) return;
        let oldLength = this.latestAllDataArr.length;
        if (oldLength > this.showAtTheSameTimeSpotNums) {
          for(var i=0;i<this.latestAllDataArr.length;i++)
          {
            this.latestAllDateTimeArr[i] = this.latestAllDateTimeArr[i].slice(oldLength - this.showAtTheSameTimeSpotNums);
            this.latestAllDataArr[i] = this.latestAllDataArr[i].slice(oldLength - this.showAtTheSameTimeSpotNums);
          }
        }
        this.current_showAtTheSameTimeSpotNums = this.showAtTheSameTimeSpotNums;
        this.readyForDrawSPCCharts();
      },

      echoSelectChangedHandler()
      {

        if(this.currentViewFeaturesList[0] != this.defaultLabel && this.currentViewFeaturesList.indexOf(this.defaultLabel)>-1)
        {
          if(this.bak_spcFeaturesArr.length>8)
          {
            this.ifNeedShowAllFeaturesFlag = true;

            this.bak_currentViewFeaturesList = this.currentViewFeaturesList.slice(0,-1);

          } else {
            setTimeout(()=>{
              this.currentViewFeaturesList = [this.defaultLabel];
            },200);
          }

        } else if(this.currentViewFeaturesList[0] == this.defaultLabel && this.currentViewFeaturesList.length>1){

          setTimeout(()=>{
              this.currentViewFeaturesList = [this.currentViewFeaturesList[1]];
          },200);

        }

        this.$refs.mySelectEntity.hideMenu(); // 这里是直接调用 iView Select 组件里的方法
      },

      ok_for_show_all_features(){
        this.ifNeedShowAllFeaturesFlag = false;
        setTimeout(()=>{
          this.currentViewFeaturesList = [this.defaultLabel];
        },200);
      },

      cancel_for_show_all_features()
      {
        setTimeout(()=>{
          this.currentViewFeaturesList = JSON.parse(JSON.stringify(this.bak_currentViewFeaturesList));
      },200);

        this.ifNeedShowAllFeaturesFlag = false;
      },

      // 在选择了下拉复选框后，重新渲染图片
      renewDrawCharts(){

        if(this.initFirstFlag || this.ifNeedShowAllFeaturesFlag) return;

        // console.log("在选择了下拉复选框后，重新渲染图片")
        // console.log("this.currentViewFeaturesList=="+this.currentViewFeaturesList);
        // console.log("this.currentViewFeaturesList.length=="+this.currentViewFeaturesList.length);

        if (this.currentViewFeaturesList.length == 1 && this.currentViewFeaturesList[0] == this.defaultLabel) {
          this.spcFeaturesArr = this.bak_spcFeaturesArr.map((item) => {return item});
        } else {
          this.spcFeaturesArr = this.currentViewFeaturesList.map((item) => {return item});
          let arr = [];

          for(var i=0;i<this.bak_spcFeaturesArr.length;i++)
          {

            for(var j=0;j<this.spcFeaturesArr.length;j++)
            {
              if(this.bak_spcFeaturesArr[i] == this.spcFeaturesArr[j])
              {
                arr.push(this.bak_spcFeaturesArr[i]);
              }
            }

          }

          this.spcFeaturesArr = arr.map((item) => {return item});

        }

        setTimeout(this.readyForDrawSPCCharts, 500);

      },

      selectHighlightInputContent(evt_firefox){
        let evt = window.event || evt_firefox;
        evt.target.select();
      },

      rearrangeShowElementsByWindowResize() {
        if(this.initFirstFlag) return;
        this.readyForDrawSPCCharts();
      },

       randomHexColor() { //随机生成十六进制颜色
         return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
       },

      readyForUpdateNumValue() {
       this.echoChangedForNum();
       this.updateUserSetupParas(0);
      },

      updateUserSetupParas(chartIndex){
        let newObj = {};

        newObj.initcfg = 0;

        newObj.num = this.showAtTheSameTimeSpotNums;

        newObj.idx = chartIndex;

        newObj.user_usl = this.user_all_usls[chartIndex].num;

        newObj.user_lsl = this.user_all_lsls[chartIndex].num;

        this.ws.send(JSON.stringify(newObj));
      },

      transferRealIndex(deviceAndFeature)
      {
        for(var x=0;x<this.bak_spcFeaturesArr.length;x++)
        {
          if(deviceAndFeature == this.bak_spcFeaturesArr[x])
          {
            return x;
          }
        }
      },

      echoUSLAndSoOnParasChanged(chartIndex) {

        if(this.initFirstFlag) return;

        if(this.usl_happen_changed_flag || this.lsl_happen_changed_flag){

          this.usl_happen_changed_flag = false;
          this.lsl_happen_changed_flag = false;

          this.updateUserSetupParas(chartIndex);
        }


        if(Number(this.user_all_lcls[chartIndex].num)<Number(this.user_all_lsls[chartIndex].num))
        {
          alert('LCL的值的设定不能小于LSL的值');

          this.user_all_lcls[chartIndex].num = this.old_user_all_lcls[chartIndex].num;
          this.user_all_lsls[chartIndex].num = this.old_user_all_lsls[chartIndex].num;


          return;
        }

        if(Number(this.user_all_lcls[chartIndex].num)>Number(this.user_all_means[chartIndex].num))
        {
          alert('LCL的值的设定不能大于MEAN的值');

          this.user_all_lcls[chartIndex].num = this.old_user_all_lcls[chartIndex].num;

          return;
        }

        if(Number(this.user_all_ucls[chartIndex].num)>Number(this.user_all_usls[chartIndex].num))
        {
          alert('UCL的值的设定不能大于USL的值');
          this.user_all_ucls[chartIndex].num = this.old_user_all_ucls[chartIndex].num;
          this.user_all_usls[chartIndex].num = this.old_user_all_usls[chartIndex].num;
          return;
        }

        if(Number(this.user_all_ucls[chartIndex].num)<Number(this.user_all_means[chartIndex].num))
        {
          alert('UCL的值的设定不能小于MEAN的值');
          this.user_all_ucls[chartIndex].num = this.old_user_all_ucls[chartIndex].num;
          return;
        }

        this.old_user_all_ucls[chartIndex].num = this.user_all_ucls[chartIndex].num;
        this.old_user_all_lcls[chartIndex].num = this.user_all_lcls[chartIndex].num;
        this.old_user_all_usls[chartIndex].num = this.user_all_usls[chartIndex].num;
        this.old_user_all_lsls[chartIndex].num = this.user_all_lsls[chartIndex].num;

        this.readyForDrawSPCCharts();

      },

      execInitSendAction() {
        let initSender = '{"initcfg":1}';
        this.ws.send(initSender);
      },

      updateReceivedData(recvData) {

        if(this.acceptRealtimeDataFlag == false) return;

        if(recvData.indexOf("datetime") > -1)
        {
          if(this.printRealTimeToControllPanelFlag)
          {
            console.log('recvdata:', recvData);
          }

        } else {

          console.log('recvdata:', recvData);

        }

        //recvdata: {"sigma": [0.7472020031484365, 0.7096914050494927], "devicelist": ["38", "40"], "USL": [4.48396225692174, 4.213952213758462], "featurelist": ["power", "wind_speed"], "NUM": 50, "devicenames": ["GW0001", "GW0002"], "LSL": [-4.482461780859498, -4.302344646835449], "mean": [0.0007502380311210054, -0.04419621653849336]}

        //recvdata: {"datetime": "2018-09-15 06:56:59", "Ca": 0.015029485605515395, "data": 0.724099685379013, "Cp": 9.77085366585799, "devid": "40", "Cpk": 8.59604642966111, "devname": "GW0002", "feature": "wind_speed"}


        if (recvData.indexOf("datetime") > -1) {
            //return;
          let realtimeData = JSON.parse(recvData);

          let xxx = this.spcFeaturesArr.length-1;

          let xxxValue = this.spcFeaturesArr[xxx]

          this.spcFeaturesArr.splice(xxx,1,xxxValue);

          let currentFeatureX = this.spcFeaturesArr.indexOf(realtimeData.devname + "~" + realtimeData.feature);

          let bak_currentFeatureX = this.bak_spcFeaturesArr.indexOf(realtimeData.devname + "~" + realtimeData.feature);

          //console.log("currentFeatureX==="+currentFeatureX);

          if(currentFeatureX == -1) return;

          if(!this.latestAllDateTimeArr[bak_currentFeatureX].in_array(realtimeData.datetime)){

            //console.log("currentFeatureX===="+currentFeatureX)

            this.latestAllDateTimeArr[bak_currentFeatureX].push(realtimeData.datetime);

            this.latestAllDataArr[bak_currentFeatureX].push(Number(realtimeData.data));

            this.latestAllCa[bak_currentFeatureX] = Number(realtimeData.Ca).toFixed(2);

            this.latestAllCp[bak_currentFeatureX] = Number(realtimeData.Cp).toFixed(2);

            this.latestAllCpk[bak_currentFeatureX] = Number(realtimeData.Cpk).toFixed(2);
          }


          if (this.latestAllDataArr[bak_currentFeatureX].length > this.showAtTheSameTimeSpotNums) {

            this.latestAllDateTimeArr[bak_currentFeatureX].shift();
            this.latestAllDataArr[bak_currentFeatureX].shift();

          }

          if(this.bak_spcFeaturesArr.length>8)
          {
            // 如果所有 Features 加起来数量大于 8 ，则执行下面的延时渲染语句

              if(this.recentRT == null)
              {
                this.recentRT = new Date(realtimeData.datetime).getTime();
              }

              let rt = new Date(realtimeData.datetime).getTime();

              if(rt - this.recentRT > 1001)
              {
                this.recentRT = rt;
                this.readyForDrawSPCCharts();
              }

          } else {

            // 如果 Features 总数很少，就直接实时显示好了，浏览器能扛得住。

            this.readyForDrawSPCCharts();

          }

        }

        if (recvData.indexOf("sigma") > -1) {

          this.initFirstFlag = false;

          this.d('tempHinterLayer').style.display = "none";

          clearInterval(this.cycle_send_action_id);

          this.cycle_send_action_id = null;

          //单引号转换成双引号，小括号变成中括号
          recvData = recvData.replace(/'/g, '"').replace(/\)/g,"]").replace(/\(/g,"[");

          let basicSetupData = JSON.parse(recvData);

          //basicSetupData.featurenames = ['液压站压力','液压泵运行','液压站温度'];

          this.showAtTheSameTimeSpotNums = Number(basicSetupData.NUM);

          this.current_showAtTheSameTimeSpotNums = this.showAtTheSameTimeSpotNums;

          this.spcFeaturesArr = [];

          this.preDefineColorArr = [];

          this.spcFeaturesAddAllOptionArr = [this.defaultLabel];

          for(var i=0;i<basicSetupData.devicenames.length;i++)
          {
            for(var j=0;j<basicSetupData.featurelist.length;j++)
            //for(var j=0;j<8;j++)
            {
              if(basicSetupData.featurenames != null)
              {
                this.spcFeaturesArr.push(basicSetupData.devicenames[i] + "~" + basicSetupData.featurenames[j]);
              } else {
                this.spcFeaturesArr.push(basicSetupData.devicenames[i] + "~" + basicSetupData.featurelist[j]);
              }

            }
          }

          this.availableArr = [];

          console.log("this.spcFeaturesArr=="+this.spcFeaturesArr.length);

          this.bak_spcFeaturesArr = JSON.parse(JSON.stringify(this.spcFeaturesArr));

          for (var i = 0; i < this.spcFeaturesArr.length; i++)
          {
            this.spcFeaturesAddAllOptionArr.push(this.spcFeaturesArr[i]);

            if(i<this.houxuanColors.length)
            {
              this.preDefineColorArr.push(this.houxuanColors[i]);
            } else {
              this.preDefineColorArr.push(this.randomHexColor());
            }

            this.latestAllDateTimeArr.push([]);

            this.latestAllDataArr.push([]);

            this.latestAllCa.push("");

            this.latestAllCp.push("");

            this.latestAllCpk.push("");

            this.availableArr[i] = 1;

          }

          this.currentViewFeaturesList = [this.spcFeaturesArr[0]];

          let a_user_all_usls = basicSetupData.USL
          let a_user_all_lsls = basicSetupData.LSL;
          let a_user_all_means = basicSetupData.mean;
          let a_user_all_sigmas = basicSetupData.sigma;

          a_user_all_usls = a_user_all_usls.concat(a_user_all_usls);
          a_user_all_lsls = a_user_all_lsls.concat(a_user_all_lsls);
          a_user_all_means = a_user_all_means.concat(a_user_all_means);
          a_user_all_sigmas = a_user_all_sigmas.concat(a_user_all_sigmas);

          // console.log("a_user_all_usls="+a_user_all_usls);
          // console.log("a_user_all_lsls="+a_user_all_lsls);
          // console.log("a_user_all_means="+a_user_all_means);
          // console.log("a_user_all_sigmas="+a_user_all_sigmas);

          this.user_all_usls = [];
          this.user_all_lsls = [];
          this.user_all_means = [];
          this.user_all_sigmas = [];
          this.old_user_all_usls = [];
          this.old_user_all_lsls = [];

          for(var i=0;i<a_user_all_usls.length;i++)
          {
            this.user_all_usls.push({num:Number(a_user_all_usls[i]).toFixed(2)});
            this.user_all_lsls.push({num:Number(a_user_all_lsls[i]).toFixed(2)});
            this.user_all_means.push({num:Number(a_user_all_means[i]).toFixed(2)});
            this.user_all_sigmas.push({num:Number(a_user_all_sigmas[i]).toFixed(2)});
            this.old_user_all_usls.push({num:Number(a_user_all_usls[i]).toFixed(2)});
            this.old_user_all_lsls.push({num:Number(a_user_all_lsls[i]).toFixed(2)});
          }
          //
          // console.log("this.user_all_usls="+JSON.stringify(this.user_all_usls));
          // console.log("this.user_all_lsls="+JSON.stringify(this.user_all_lsls));
          // console.log("this.user_all_means="+JSON.stringify(this.user_all_means));
          // console.log("this.user_all_sigmas="+JSON.stringify(this.user_all_sigmas));

          this.user_all_lcls = [];
          this.user_all_ucls = [];
          this.old_user_all_lcls = [];
          this.old_user_all_ucls = [];

          for(var j=0;j<this.user_all_means.length;j++)
          {
            // lcl 是 -3倍的 sigma; ucl 是 +3倍的 sigma;
            let obj_1 = {num:((Number(this.user_all_means[j].num) - 3*Number(this.user_all_sigmas[j].num))).toFixed(2)}
            let obj_1_old =
              {num:((Number(this.user_all_means[j].num) - 3*Number(this.user_all_sigmas[j].num))).toFixed(2)}
            let obj_2 = {num:((Number(this.user_all_means[j].num) + 3*Number(this.user_all_sigmas[j].num))).toFixed(2)}
            let obj_2_old =
              {num:((Number(this.user_all_means[j].num) + 3*Number(this.user_all_sigmas[j].num))).toFixed(2)}
            this.user_all_lcls.push(obj_1);
            this.user_all_ucls.push(obj_2);
            this.old_user_all_lcls.push(obj_1_old);
            this.old_user_all_ucls.push(obj_2_old);
          }
          //
          //
          // console.log("this.user_all_lcls="+JSON.stringify(this.user_all_lcls));
          // console.log("this.user_all_ucls="+JSON.stringify(this.user_all_ucls));
          // console.log("this.old_user_all_lcls="+JSON.stringify(this.old_user_all_lcls));
          // console.log("this.old_user_all_ucls="+JSON.stringify(this.old_user_all_ucls));

        }

      },

      readyForDrawSPCCharts() {

        for (var k = 0; k < this.spcFeaturesArr.length; k++) {

          if(this.d('chart_' + k) == null){
            break;
          }
          let currentChart = echarts.init(this.d('chart_' + k));

          currentChart.clear();

          this.d('chart_' + k).width = document.body.offsetWidth - 320 + "px";

          let featureName = this.spcFeaturesArr[k];

          let targetIndex;

          for(var x=0;x<this.bak_spcFeaturesArr.length;x++)
          {
            if(featureName == this.bak_spcFeaturesArr[x])
            {
              targetIndex = x;
            }
          }

          let usl_markline_value =
            new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(this.old_user_all_usls[targetIndex].num);

          let lsl_markline_value =
            new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(this.old_user_all_lsls[targetIndex].num);

          let mean_middle_markline_value =
            new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(Number(this.user_all_means[targetIndex].num).toFixed(2));

          let mean_high_markline_value =
            new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(this.old_user_all_ucls[targetIndex].num);

          let mean_low_markline_value =
            new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(this.old_user_all_lcls[targetIndex].num);

          let time_data_arr = this.latestAllDateTimeArr[targetIndex];



          let real_data_arr = this.latestAllDataArr[targetIndex];

          if(time_data_arr.length>this.current_showAtTheSameTimeSpotNums)
          {
            time_data_arr = time_data_arr.slice(0,this.current_showAtTheSameTimeSpotNums);
            real_data_arr = real_data_arr.slice(0,this.current_showAtTheSameTimeSpotNums);
          }

          let focusHighlightsArr = this.highlightBeyondLimitData(real_data_arr,usl_markline_value[0],lsl_markline_value[0],mean_high_markline_value[0],mean_low_markline_value[0]);

          let pointedColor = this.preDefineColorArr[targetIndex];

          //currentChart.resize();

          let option = this.getAimOptionForECharts(
                              focusHighlightsArr,
                              pointedColor,
                              currentChart.getWidth() - this.chartLeftMarginBlankWidth - this.chartRightMarginBlankWidth,
                              featureName,
                              time_data_arr,
                              real_data_arr,
                              usl_markline_value,
                              lsl_markline_value,
                              mean_middle_markline_value,
                              mean_high_markline_value,
                              mean_low_markline_value);

          let ownerHost = this;

          if(ownerHost.availableArr[k] == 1){
            ownerHost.availableArr[k] = 0;
            currentChart.clear();
            currentChart.on('finished', function () {

              ownerHost.availableArr[k] = 1;
            });
            currentChart.setOption(option,true);
          }


          //setTimeout(this.delay3SecondsReviseAnimation,3000,currentChart);
        }

        this.chartWholeShowFlag = true;

        this.initFirstFlag = false;
      },


      highlightBeyondLimitData(dataArr,usl,lsl,ucl,lcl){
        let arr = [];
        for(var i=0;i<dataArr.length;i++)
        {
          if(dataArr[i]>usl || dataArr[i]<lsl) {
            let a = new Object();
            a.coord = [i, dataArr[i]];
            a.symbol = 'circle';
            a.symbolSize = '12';
            arr.push(a);
          } else if(dataArr[i]>ucl || dataArr[i]<lcl){
            let b = new Object();
            b.coord = [i, dataArr[i]];
            b.symbol = 'emptycircle';
            b.symbolSize = '9';
            arr.push(b);
          }
        }
        return arr;
      },


      recombineMapArr(index) {
        let arr = [];
        for (var i = 0; i < this.latestAllDataArr.length; i++) {
          arr.push(this.latestAllDataArr[i][index]);
        }
        return arr;
      },

      delay3SecondsReviseAnimation(currentChart){
        currentChart.setOption({animation:true})
      },

      getAimOptionForECharts(focusHighlightsArr,pointedColor,
                             chartRealWidth, featureName, time_data_arr,
                             real_data_arr, usl, lsl, mean_middle, mean_high, mean_low) {
        //color: ['#FFA500','#FF0000','#FF00FF','#FFFF00','#000000','#0000ff'],
        // pointedColor = '#FFA500'
        this.option = {
          title: {
            text: ''
          },
          tooltip: {
            trigger: 'axis',
            extraCssText: 'letter-spacing:1px',
            borderColor: '#777777',
            borderWidth: 1,
            backgroundColor: 'rgba(255,255,224,0.7)',
            textStyle: {
              color: '#000',
              align: 'left',
              fontFamily: 'Verdana'
            },
            formatter: '{b0}<br />{a0}:{c0}'
          },
          legend: {
            itemHeight: 7,
            itemWidth: 15,
            data: [
              {
                name: featureName,
                icon: 'rect'
              }],
            textStyle: {
              fontSize: 14
            }

          },
          grid: {
            left: this.chartLeftMarginBlankWidth,
            right: this.chartRightMarginBlankWidth,
            top: 45,
            bottom: 45
          },
          animation: false, // 禁止折线图展现动画
          color: [pointedColor, '#7f7f7f', '#7f7f7f', '#7f7f7f', '#7f7f7f', '#7f7f7f'],
          xAxis: [{
            name: '',
            nameGap: 10,
            boundaryGap: false,
            data: time_data_arr,
            axisLine:{
              onZero:false
            },
            axisLabel: {
              interval: 'auto',
              showMinLabel: true,
              showMaxLabel: true,
              align: 'center',
              inside: false,
              textStyle: {
                color: '#000'
              }
            },
            splitLine: {
              show: false
            }
          }],
          yAxis: [{
            name: "",
            nameTextStyle: {
              width: '100%'
            },
            type: 'value',
            splitLine: {
              show: false
            },
            scale:true

          }],
          series: [
            {
              name: featureName,
              type: 'line',
              smooth:true,
              symbol:'roundRect',
              symbolSize:8,
              showSymbol: false,
              lineStyle: {
                width: 3
              },
              data: real_data_arr,
              markPoint:{
                data:focusHighlightsArr
              }
            },
            {
              name: 'USL',
              type: 'line',
              data: usl,
              symbol: 'none',
              lineStyle: {
                width: 2
              },
              markPoint: {
                symbol: 'circle',
                symbolSize: 1,
                symbolOffset: [chartRealWidth, 0],
                label: {
                  show: true,
                  color: '#000',
                  fontSize: 14,
                  align: 'left',
                  padding: [0, 0, 0, 15],
                  formatter: 'USL : ' + usl[0]
                },
                data: [
                  {
                    type: 'max'
                  }
                ]
              }
            },
            {
              name: 'LSL',
              type: 'line',
              data: lsl,
              symbol: 'none',
              lineStyle: {
                width: 2
              },
              markPoint: {
                symbol: 'circle',
                symbolSize: 1,
                symbolOffset: [chartRealWidth, 0],
                label: {
                  show: true,
                  color: '#000',
                  fontSize: 14,
                  align: 'left',
                  padding: [0, 0, 0, 15],
                  formatter: 'LSL : ' + lsl[0]
                },
                data: [
                  {
                    type: 'max'
                  }
                ]
              }
            }
            ,
            {
              name: 'mean+3σ',
              type: 'line',
              data: mean_high,
              symbol: 'none',
              lineStyle: {
                width: 1,
                type: 'dashed'
              },
              markPoint: {
                symbol: 'circle',
                symbolSize: 1,
                symbolOffset: [chartRealWidth, 0],
                label: {
                  show: true,
                  color: '#000',
                  fontSize: 14,
                  align: 'left',
                  padding: [0, 0, 0, 15],
                  formatter: 'UCL : ' + mean_high[0]
                },
                data: [
                  {
                    type: 'max'
                  }
                ]
              }
            }
            ,
            {
              name: 'mean',
              type: 'line',
              data: mean_middle,
              symbol: 'none',
              lineStyle: {
                width: 1,
                type: 'dashed'
              },
              markPoint: {
                symbol: 'circle',
                symbolSize: 1,
                symbolOffset: [chartRealWidth, 0],
                label: {
                  show: true,
                  color: '#000',
                  fontSize: 14,
                  align: 'left',
                  padding: [0, 0, 0, 15],
                  formatter: 'MEAN : ' + mean_middle[0]
                },
                data: [
                  {
                    type: 'max'
                  }
                ]
              }
            }
            ,
            {
              name: 'mean-3σ',
              type: 'line',
              data: mean_low,
              symbol: 'none',
              lineStyle: {
                width: 1,
                type: 'dashed'
              },
              markPoint: {
                symbol: 'circle',
                symbolSize: 1,
                symbolOffset: [chartRealWidth, 0],
                label: {
                  show: true,
                  color: '#000',
                  fontSize: 14,
                  fontFamily: 'Microsoft YaHei',
                  align: 'left',
                  padding: [0, 0, 0, 15],
                  formatter: 'LCL : ' + mean_low[0]
                },
                data: [
                  {
                    type: 'max'
                  }
                ]
              }
            }
          ]
        };

        return this.option;
      },
    },
  }
  //
  //@font-face{font-family:Ionicons;src:url(/static/font/ionicons.eot?v=2.0.0);src:url(/static/font/ionicons.eot?v=2.0.0#iefix) format("embedded-opentype"),url(/static/font/ionicons.ttf?v=2.0.0) format("truetype"),url(/static/font/ionicons.woff?v=2.0.0) format("woff"),url(/static/font/ionicons.svg?v=2.0.0#Ionicons)

</script>

<style>
  #app {
    font-family: Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
  }

  .u-besuredelsty {
    font-family: "Microsoft YaHei";
    font-size: 16px;
  }

  .vertical-center-modal {
    align-items: center;
    justify-content: center;
  }

  .m-outputPrint{
    position:fixed;
    top:90px;
    right:50px;
    opacity: 0;
    margin-left:10px;
    display:inline-block;
  }

  .m-selectBoxes{
    margin-right:70px;
  }

  .m-updateNumBtn {
    display: inline-block;
    margin-left: 15px;
  }

  .m-updateUSLAndLSLBtn {
    margin-left: 15px;
  }

  #sonTitle {
    width:1200px;
    display:inline-block;
    font-size: 16px;
  }

  .ivu-input {
    font-size: 14px !important;
    text-align: center !important;
  }

  .m-ca-cp-cpk-label {
    float: left;
    margin-left: 30px;
    margin-top:6px;
    font-weight:700;
  }

  .m-usl-lsl-label{
    float: right;
    margin-right: 60px;
  }

  .u-onec-label {
    width: 100px;
    margin-right: 20px;
  }

  .titlelay {
    width: 100%;
    margin-top: 21px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .m-spcChart {
    width: auto;
    margin-left:150px;
    margin-right:150px;
    height: 400px;
    text-align: center;
  }

  .m-addtionalControllBar{
    width: auto;
    margin-left:150px;
    margin-right:150px;
  }

  .titleinner {
    text-align: center;
    font-size: 24px;
    font-bold: 700;
  }

  .tempHinterLayer {
    width: 100%;
    margin-top: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tempHinterInner {
    text-align: center;
    font-size: 20px;
    font-bold: 500;
  }

  .m-huabu {
    font-size: 14px;
    width: auto;
    height: auto;
    margin-top: 30px;
    text-align:center;
  }


</style>
