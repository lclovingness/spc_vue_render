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
        <span class="m-selectBoxes">当前图表显示：

        <Select v-model="currentViewFeaturesList" multiple style="width:180px;text-align:left" @on-change="echoSelectChangedHandler"
                ref ="mySelectEntity">
          <Option v-for="(item,index) in spcFeaturesAddAllOptionArr" :value="item" :key="item">{{ item }}</Option>
        </Select>

        </span>

        <span>自定义同时显示数据点的数量：
        <Input v-model="showAtTheSameTimeSpotNums" style="width: 40px"
               @on-focus="selectHighlightInputContent"></Input> 个
        <Button size="default" type="primary" class="m-updateNumBtn" @click="readyForUpdateNumValue">点击更新</Button>
        </span>
      </div>
      <div v-for="(item,index) in spcFeaturesArr">
        <hr style="margin-top:20px;margin-bottom:20px;height:1px;border:none;border-top:1px ridge gray;" v-show="!initFirstFlag"/>
        <br>
        <div :id="'chart_'+index" class="m-spcChart"></div>
        <div v-show="chartWholeShowFlag">
          <span class="m-ca-cp-cpk-label">
            <span class="u-onec-label">Ca: {{latestAllCa[index]}}</span>
            <span class="u-onec-label">Cp: {{latestAllCp[index]}}</span>
            <span class="u-onec-label">Cpk: {{latestAllCpk[index]}}</span>
          </span>
          <span class="m-usl-lsl-label">
                自定义 —— LSL: <Input v-model="user_all_lsls[index].num" style="width: 60px;margin-right:20px"
                                   @on-focus="selectHighlightInputContent" number></Input>USL:
            <Input v-model="user_all_usls[index].num" style="width: 60px;margin-right:20px" @on-focus="selectHighlightInputContent" number></Input>
            LCL:
            <Input v-model="user_all_lcls[index].num" style="width: 60px;margin-right:20px"
                   @on-focus="selectHighlightInputContent" number></Input>
            UCL:
            <Input v-model="user_all_ucls[index].num" style="width: 60px" @on-focus="selectHighlightInputContent" number></Input>
              <Button
                size="default" type="primary" class="m-updateUSLAndLSLBtn" @click="echoUSLAndSoOnParasChanged(index)">
                点击更新
              </Button>
          </span>
        </div>
        <br>
        <br>
      </div>
      <br>
      <br>
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
        w2:'123',
        spcFeaturesAddAllOptionArr:[],
        currentViewFeaturesList:['—— All Features ——'],
        ws: null,
        myChart: null,
        spcFeaturesArr: [],
        showAtTheSameTimeSpotNums: 0,
        current_showAtTheSameTimeSpotNums:0,
        chartIndex: 0,
        chartDateTimeArr: [],
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
        //this.ws = new Socket('ws://spc0427.neuseer.cn/');
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

      this.houxuanColors = this.houxuanColors.concat(arr);

      //this.simulateInitData();
    },

    methods: {

      echoChangedForNum()
      {
        if(this.initFirstFlag) return;
        let oldLength = this.latestAllDataArr.length;
        if (oldLength > this.showAtTheSameTimeSpotNums) {
          this.chartDateTimeArr = this.chartDateTimeArr.slice(oldLength - this.showAtTheSameTimeSpotNums);
          this.latestAllDataArr = this.latestAllDataArr.slice(oldLength - this.showAtTheSameTimeSpotNums);
        }
        //console.log(oldLength + "旧的和新的" + this.chartDateTimeArr.length);
        this.current_showAtTheSameTimeSpotNums = this.showAtTheSameTimeSpotNums;
        this.readyForDrawSPCCharts();
      },

      echoSelectChangedHandler(arr){

        if(arr.find((element) => (element == this.defaultLabel)))
        {
          if(arr[0] == this.defaultLabel && arr.length >1)
          {
            arr.shift();
          }

          if(arr[arr.length-1] == this.defaultLabel && arr.length >1){
            while(arr.length>1)
            {
              arr.shift();
            }
          }

        }else if(arr.length == 0){

          arr.push(this.defaultLabel);

        }

        this.$refs.mySelectEntity.hideMenu(); // 这里是直接调用 iView Select 组件里的方法
      },

      renewDrawCharts(){

        /*
        recvdata: {"LSL": "[-1.2099789994074721, -1.0985858278838847]", "USL": "[-1.1189420812338151, -0.7057414610631854]", "NUM": "100", "FeatureList": "['generator_speed', 'power']", "sigma": "[0.015172819695609525, 0.06547406113678321]", "mean": "[-1.1644605403206436, -0.902163644473535]"}
         */

        if(this.initFirstFlag) return;

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

        //console.log("-----"+this.spcFeaturesArr.toString());
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

      simulateInitData() {

        this.spcFeaturesArr = ['wind_direction','generator_speed'];

        this.bak_spcFeaturesArr = ['wind_direction','generator_speed'];
        //this.spcFeaturesAddAllOptionArr = ['创建应用时配置的所有特征参数'];
        this.spcFeaturesAddAllOptionArr = [this.defaultLabel];
        for(var i=0;i<this.spcFeaturesArr.length;i++)
        {
          this.spcFeaturesAddAllOptionArr.push(this.spcFeaturesArr[i]);
        }
        //this.spcFeaturesAddAllOptionArr = this.spcFeaturesArr.concat(['创建应用时配置所有特征参数']);
        this.currentViewFeaturesList = [this.defaultLabel];

        this.showAtTheSameTimeSpotNums = 9;

        this.current_showAtTheSameTimeSpotNums = this.showAtTheSameTimeSpotNums;


        this.chartDateTimeArr = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
        this.latestAllDataArr = [[-5.2424242, -30.4214124, -50.254235, 45.85687, 60.745657, 20.474747467, 55.74747476,
          33.4745757, 105.74674747], [6.7476747, 32.74767475, 45.74764747, 51.74657475, -38.4775757, 99.747657757,
          45.74757457, 59.7456757,
          28.435323]];
        this.latestAllCa = [11.3455666, 12.567890].map((item) => {return item.toFixed(2)});
        this.latestAllCp = [13.45667, 20.76575].map((item) => {return item.toFixed(2)});
        this.latestAllCpk = [15.41431, 18.523453253].map((item) => {return item.toFixed(2)});
        this.user_all_usls = [{num:95}, {num:90}];
        this.user_all_lsls = [{num:-40}, {num:-30}];
        this.old_user_all_usls = [{num:95}, {num:90}];
        this.old_user_all_lsls = [{num:-40}, {num:-30}];
        this.user_all_means = [{num:35.63465464356}, {num:39.634564}]
        this.user_all_sigmas = [{num:20.63645636}, {num:10.9999988888}]

        this.user_all_lcls = [];
        this.user_all_ucls = [];
        this.old_user_all_lcls = [];
        this.old_user_all_ucls = [];

        for(var j=0;j<this.user_all_means.length;j++)
        {
          let obj_1 = {num:(this.user_all_means[j].num - 2*this.user_all_sigmas[j].num).toFixed(2)}
          let obj_2 = {num:(this.user_all_means[j].num + 2*this.user_all_sigmas[j].num).toFixed(2)}
          this.user_all_lcls.push(obj_1);
          this.user_all_ucls.push(obj_2);
          this.old_user_all_lcls.push(JSON.parse(JSON.stringify(obj_1)));
          this.old_user_all_ucls.push(JSON.parse(JSON.stringify(obj_2)));
        }

        this.d('tempHinterLayer').style.display = "none";

        this.preDefineColorArr = [];
        for (var i = 0; i < this.spcFeaturesArr.length; i++) {
          //this.preDefineColorArr.push(this.randomHexColor());
          this.preDefineColorArr.push(this.houxuanColors[i]);
        }

        this.simulateDemoFlag = true;

        setTimeout(this.readyForDrawSPCCharts, 1000);
      },

      // randomHexColor() { //随机生成十六进制颜色
      //   return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
      // },

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
        //if (this.simulateDemoFlag) return;
        let initSender = '{"initcfg":1}';
        this.ws.send(initSender);
      },

      updateReceivedData(recvData) {
        console.log('recvdata:', recvData);
        //return;
        if (recvData.indexOf("datetime") > -1) {

          let realData = JSON.parse(recvData);

          this.chartDateTimeArr.push(realData.datetime);

          let darr = realData.data.slice(1,-1).split(",");

          for(var j=0;j<darr.length;j++)
          {
            darr[j] = Number(darr[j]);
          }

          this.latestAllDataArr.push(darr);

          let ca = realData.Ca.slice(1,-1).split(",");
          let cp = realData.Cp.slice(1,-1).split(",");
          let cpk = realData.Cpk.slice(1,-1).split(",");

          for(var i=0;i<ca.length;i++)
          {
            ca[i] = Number(ca[i]);
            cp[i] = Number(cp[i]);
            cpk[i] = Number(cpk[i]);
          }

          this.latestAllCa = ca.map((item) => {return item.toFixed(2)});
          //
          this.latestAllCp = cp.map((item) => {return item.toFixed(2)});
          //
          this.latestAllCpk = cpk.map((item) => {return item.toFixed(2)});
          if (this.latestAllDataArr.length > this.showAtTheSameTimeSpotNums) {
            this.chartDateTimeArr.shift();
            this.latestAllDataArr.shift();
          }

          this.readyForDrawSPCCharts();

          this.initFirstFlag = false;

          this.d('tempHinterLayer').style.display = "none";

        }


        if (recvData.indexOf("FeatureList") > -1) {

          let basicSetupData = JSON.parse(recvData);

          this.showAtTheSameTimeSpotNums = Number(basicSetupData.NUM);

          this.current_showAtTheSameTimeSpotNums = this.showAtTheSameTimeSpotNums;

          let featureArr = basicSetupData.FeatureList.slice(1,-1).split(",");

          for(var k=0;k<featureArr.length;k++)
          {
            if(k==0)
            {
              featureArr[k] = featureArr[k].slice(1,-1);
            } else {
              featureArr[k] = featureArr[k].slice(2,-1);
            }

          }

          this.spcFeaturesArr = featureArr;

          this.bak_spcFeaturesArr = JSON.parse(JSON.stringify(featureArr));

          this.spcFeaturesAddAllOptionArr = [this.defaultLabel];
          for(var i=0;i<this.spcFeaturesArr.length;i++)
          {
            this.spcFeaturesAddAllOptionArr.push(this.spcFeaturesArr[i]);
          }
          this.currentViewFeaturesList = [this.defaultLabel];

          let a_user_all_usls = basicSetupData.USL.slice(1,-1).split(",");
          let a_user_all_lsls = basicSetupData.LSL.slice(1,-1).split(",");
          let a_user_all_means = basicSetupData.mean.slice(1,-1).split(",");
          let a_user_all_sigmas = basicSetupData.sigma.slice(1,-1).split(",");

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

          //console.log(JSON.stringify(this.user_all_usls));

          this.user_all_lcls = [];
          this.user_all_ucls = [];
          this.old_user_all_lcls = [];
          this.old_user_all_ucls = [];

          for(var j=0;j<this.user_all_means.length;j++)
          {

            let obj_1 = {num:(Number(this.user_all_means[j].num) - 2*Number(this.user_all_sigmas[j].num)).toFixed(2)}
            let obj_1_old = {num:(Number(this.user_all_means[j].num) - 2*Number(this.user_all_sigmas[j].num)).toFixed(2)}
            let obj_2 = {num:(Number(this.user_all_means[j].num) + 2*Number(this.user_all_sigmas[j].num)).toFixed(2)}
            let obj_2_old = {num:(Number(this.user_all_means[j].num) + 2*Number(this.user_all_sigmas[j].num)).toFixed(2)}
            this.user_all_lcls.push(obj_1);
            this.user_all_ucls.push(obj_2);
            this.old_user_all_lcls.push(obj_1_old);
            this.old_user_all_ucls.push(obj_2_old);
          }
          // console.log("this.spcFeaturesArr="+this.spcFeaturesArr+"~~~~~"+this.spcFeaturesArr.length);
          // console.log("this.user_all_usls="+this.user_all_usls+"~~~~~"+this.user_all_usls.length);
          // console.log("this.user_all_lsls="+this.user_all_lsls+"~~~~~"+this.user_all_lsls.length);
          // console.log("this.user_all_means="+this.user_all_means+"~~~~~"+this.user_all_means.length);
          // console.log("this.user_all_sigmas="+this.user_all_sigmas+"~~~~~"+this.user_all_sigmas.length);

          this.preDefineColorArr = [];

          for (var i = 0; i < this.spcFeaturesArr.length; i++) {
            //this.preDefineColorArr.push(this.randomHexColor());
            this.preDefineColorArr.push(this.houxuanColors[i]);
          }
        }


      },

      readyForDrawSPCCharts() {

        for (var k = 0; k < this.spcFeaturesArr.length; k++) {

          let currentChart = echarts.init(this.d('chart_' + k));

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

          let time_data_arr = this.chartDateTimeArr;

          let real_data_arr;

          if (this.simulateDemoFlag) {
            real_data_arr = this.latestAllDataArr[targetIndex];
          } else {
            real_data_arr = this.recombineMapArr(targetIndex);
          }

          //let exceedLimitUSLOrLSLDataDataArr = this.highlightBeyondUSLOrLSLData(real_data_arr,usl_markline_value[0],lsl_markline_value[0])
          //let exceedLimitUCLOrLCLDataDataArr = this.highlightBeyondUCLOrLCLData(real_data_arr,mean_high_markline_value[0],mean_low_markline_value[0])

          let focusHighlightsArr = this.highlightBeyondLimitData(real_data_arr,usl_markline_value[0],lsl_markline_value[0],mean_high_markline_value[0],mean_low_markline_value[0]);
          let pointedColor = this.preDefineColorArr[targetIndex];

          currentChart.resize();

          currentChart.setOption(this.getAimOptionForECharts(focusHighlightsArr,pointedColor, currentChart.getWidth()
            - this.chartLeftMarginBlankWidth - this.chartRightMarginBlankWidth, featureName, time_data_arr,
            real_data_arr, usl_markline_value, lsl_markline_value, mean_middle_markline_value, mean_high_markline_value, mean_low_markline_value), true);

          setTimeout(this.delay3SecondsReviseAnimation,3000,currentChart);
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
            }

          }],
          series: [
            {
              name: featureName,
              type: 'line',
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

  .m-selectBoxes{
    margin-right:70px;
  }

  .m-updateNumBtn {
    margin-left: 15px;
  }

  .m-updateUSLAndLSLBtn {
    margin-left: 15px;
  }

  #sonTitle {
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
    height: 400px;
    text-align: center;
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
    margin-top: 20px;
    margin-left: 160px;
    margin-right: 160px;
  }


</style>
