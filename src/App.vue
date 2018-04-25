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
                自定义 —— LSL: <Input v-model="user_all_lsls[index]" style="width: 60px;margin-right:20px"
                                   @on-focus="selectHighlightInputContent"></Input>USL:
            <Input v-model="user_all_usls[index]" style="width: 60px" @on-focus="selectHighlightInputContent"></Input>
              <Button
                size="default" type="primary" class="m-updateUSLAndLSLBtn" @click="sendBackAfterSomeParasChanged(index)">
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
        spcFeaturesAddAllOptionArr:[],
        currentViewFeaturesList:[],
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
        defaultLabel:'—— All Features ——'
      }
    },
    watch: {
      currentViewFeaturesList(val, oldVal) {
        this.renewDrawCharts();
      },
    },
    mounted: function () {
      let host = window.location.host;
      let wsServer = 'ws://' + host + '/';

      console.log("host==="+host);
      if(host.indexOf("localhost:")>-1 || host === '')
      {
        wsServer = 'ws://spc0425.neuseer.cn/'
      }

      let Socket = 'MozWebSocket' in window ? MozWebSocket : WebSocket;

      let ownerparent = this;

      this.ws = new Socket(wsServer);

      //this.ws = new Object();

      this.ws.onerror = function (evt) {
        console.log(evt);
      }

      this.ws.onmessage = function (evt) {
        ownerparent.updateReceivedData(evt.data);
      };

      this.ws.onprob = function () {
        console.log('Socket connection probd');
      };

      this.ws.onopen = function () {

        console.log('Socked Connected OK');
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

        this.$refs.mySelectEntity.hideMenu(); // 这里是直接调用组件里的方法
      },

      renewDrawCharts(){

        /*
        recvdata: {"LSL": "[-1.2099789994074721, -1.0985858278838847]", "USL": "[-1.1189420812338151, -0.7057414610631854]", "NUM": "100", "FeatureList": "['generator_speed', 'power']", "sigma": "[0.015172819695609525, 0.06547406113678321]", "mean": "[-1.1644605403206436, -0.902163644473535]"}
         */

        //

        //console.log("this.initFirstFlag="+this.initFirstFlag);

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
        this.readyForDrawSPCCharts();
      },

      simulateInitData() {
        this.spcFeaturesArr = ["wind_direction", "generator_speed"];
        this.bak_spcFeaturesArr = ["wind_direction", "generator_speed"];
        //this.spcFeaturesAddAllOptionArr = ['创建应用时配置的所有特征参数'];
        this.spcFeaturesAddAllOptionArr = [this.defaultLabel];
        for(var i=0;i<this.spcFeaturesArr.length;i++)
        {
          this.spcFeaturesAddAllOptionArr.push(this.spcFeaturesArr[i]);
        }
        //this.spcFeaturesAddAllOptionArr = this.spcFeaturesArr.concat(['创建应用时配置所有特征参数']);
        this.currentViewFeaturesList = [this.defaultLabel];

        this.showAtTheSameTimeSpotNums = 9;
        this.chartDateTimeArr = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
        this.latestAllDataArr = [[-5.2424242, -30.4214124, -50.254235, 45.85687, 60.745657, 20.474747467, 55.74747476,
          33.4745757, 105.74674747], [6.7476747, 32.74767475, 45.74764747, 51.74657475, -38.4775757, 99.747657757,
          45.74757457, 59.7456757,
          28.435323]];
        this.latestAllCa = [11.3455666, 12.567890].map((item) => {return item.toFixed(2)});
        this.latestAllCp = [13.45667, 20.76575].map((item) => {return item.toFixed(2)});
        this.latestAllCpk = [15.41431, 18.523453253].map((item) => {return item.toFixed(2)});
        this.user_all_usls = [95, 90];
        this.user_all_lsls = [-40, -30];
        this.user_all_means = [35.63465464356, 39.634564].map((item) => {return Number(item.toFixed(2))});
        this.user_all_sigmas = [20.63645636, 10.9999988888].map((item) => {return Number(item.toFixed(2))});

        this.d('tempHinterLayer').style.display = "none";

        this.preDefineColorArr = [];
        for (var i = 0; i < this.spcFeaturesArr.length; i++) {
          //this.preDefineColorArr.push(this.randomHexColor());
          this.preDefineColorArr.push(this.houxuanColors[i]);
        }

        this.simulateDemoFlag = true;

        setTimeout(this.readyForDrawSPCCharts, 1000);
      },

      randomHexColor() { //随机生成十六进制颜色
        return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
      },

      readyForUpdateNumValue() {
        //alert("fasfa")
        //this.chartDateTimeArr = this.chartDateTimeArr.slice(0, this.showAtTheSameTimeSpotNums);
        //this.latestAllDataArr = this.latestAllDataArr.slice(0, this.showAtTheSameTimeSpotNums);

        this.echoChangedForNum();

        this.sendBackAfterSomeParasChanged(0);
      },

      sendBackAfterSomeParasChanged(chartIndex) {
        //alert("this.user_all_usls[chartIndex]="+this.user_all_usls[chartIndex])
        //if (this.simulateDemoFlag) return;
        let newObj = {};

        newObj.initcfg = 0;

        newObj.num = this.showAtTheSameTimeSpotNums;

        newObj.idx = chartIndex;

        newObj.user_usl = this.user_all_usls[chartIndex];

        newObj.user_lsl = this.user_all_lsls[chartIndex];

        this.ws.send(JSON.stringify(newObj));
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

          this.bak_spcFeaturesArr = featureArr;

          this.spcFeaturesAddAllOptionArr = [this.defaultLabel];
          for(var i=0;i<this.spcFeaturesArr.length;i++)
          {
            this.spcFeaturesAddAllOptionArr.push(this.spcFeaturesArr[i]);
          }
          this.currentViewFeaturesList = [this.defaultLabel];

          this.user_all_usls = basicSetupData.USL.slice(1,-1).split(",");
          this.user_all_lsls = basicSetupData.LSL.slice(1,-1).split(",");
          this.user_all_means = basicSetupData.mean.slice(1,-1).split(",");
          this.user_all_sigmas = basicSetupData.sigma.slice(1,-1).split(",");

          for(var i=0;i<this.user_all_usls.length;i++)
          {
            this.user_all_usls[i] = Number(this.user_all_usls[i]).toFixed(2);
            this.user_all_lsls[i] = Number(this.user_all_lsls[i]).toFixed(2);
            this.user_all_means[i] = Number(this.user_all_means[i]).toFixed(2);
            this.user_all_sigmas[i] = Number(this.user_all_sigmas[i]).toFixed(2);
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
            new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(this.user_all_usls[targetIndex]);

          let lsl_markline_value = new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(this.user_all_lsls[targetIndex]);

          let mean_middle_markline_value = new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(this.user_all_means[targetIndex]);

          let xx = (Number(this.user_all_means[targetIndex]) +Number(2*this.user_all_sigmas[targetIndex])).toFixed(2);

          let mean_high_markline_value = new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(xx);

          let yy = (Number(this.user_all_means[targetIndex]) - Number(2*this.user_all_sigmas[targetIndex])).toFixed(2);

          let mean_low_markline_value = new Array(Number(this.current_showAtTheSameTimeSpotNums)).fill(yy);

          let time_data_arr = this.chartDateTimeArr;

          // let real_data_arr = this.recombineMapArr(k);
          let real_data_arr;

          if (this.simulateDemoFlag) {
            real_data_arr = this.latestAllDataArr[targetIndex];
          } else {
            real_data_arr = this.recombineMapArr(targetIndex);
          }

          let exceedLimitDataArr =
            this.highlightBeyondUSLOrLSLData(real_data_arr,usl_markline_value[0],lsl_markline_value[0])

          let pointedColor = this.preDefineColorArr[targetIndex];

          currentChart.resize();

          currentChart.setOption(this.getAimOptionForECharts(exceedLimitDataArr,pointedColor, currentChart.getWidth()
            - this.chartLeftMarginBlankWidth - this.chartRightMarginBlankWidth, featureName, time_data_arr,
            real_data_arr, usl_markline_value, lsl_markline_value, mean_middle_markline_value, mean_high_markline_value, mean_low_markline_value), true);

          setTimeout(this.delay3SecondsReviseAnimation,3000,currentChart);
        }

        this.chartWholeShowFlag = true;

        this.initFirstFlag = false;
      },

      highlightBeyondUSLOrLSLData(dataArr,usl,lsl){
        let arr = [];
        for(var i=0;i<dataArr.length;i++)
        {
          if(dataArr[i]>usl || dataArr[i]<lsl) {
            arr.push({'coord': [i, dataArr[i]]});
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

      getAimOptionForECharts(exceedLimitDataArr,pointedColor, chartRealWidth, featureName, time_data_arr,
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
                symbol: 'circle',
                symbolSize: 6,
                data:exceedLimitDataArr,
                animation:true,
                animationDuration:500
              },
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
    margin-left: 70px;
    margin-top:6px;
    font-weight:700;
  }

  .m-usl-lsl-label{
    float: right;
    margin-right: 150px;
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
