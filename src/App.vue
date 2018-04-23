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
      <div id="sonTitle" v-show="spcFeaturesArr.length>0">自定义同时显示数据点的数量：
        <Input v-model="showAtTheSameTimeSpotNums" style="width: 40px"></Input> 个
        <Button size="default" type="primary" class="m-updateNumBtn" @click="readyForUpdateNumValue">点击更新</Button>
      </div>
      <div v-for="(item,index) in spcFeaturesArr">
        <hr style="margin-top:20px;margin-bottom:20px;height:2px;border:none;border-top:2px ridge gray;"/>
        <br>
        <div :id="'chart_'+index" class="m-spcChart"></div>
        <div v-show="chartWholeShowFlag">Ca: {{latestAllCa[index]}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cp:
          {{latestAllCp[index]}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cpk:
          {{latestAllCpk[index]}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span>自定义 —— LSL: <Input v-model="user_all_lsls[index]" style="width: 40px"
          ></Input>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;USL: <Input
            v-model="user_all_usls[index]" style="width: 40px"></Input></span>
          <Button
            size="default" type="primary" class="m-updateUSLAndLSLBtn" @click="sendBackAfterSomeParasChanged(index)">
            点击更新
          </Button>
        </div>
        <br>
      </div>

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
        ws: null,
        myChart: null,
        spcFeaturesArr: [],
        showAtTheSameTimeSpotNums: 5,
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
        chartLeftMarginBlankWidth: 110,
        chartRightMarginBlankWidth: 110,
        simulateDemoFlag: false,
        chartWholeShowFlag: false
      }
    },
    watch: {},
    mounted: function () {
      let host = window.location.host;
      let wsServer = 'ws://' + host + '/';
      let Socket = 'MozWebSocket' in window ? MozWebSocket : WebSocket;
      let ownerparent = this;
      this.ws = new Socket(wsServer);
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

      this.simulateInitData();

    },

    methods: {

      rearrangeShowElementsByWindowResize() {
        this.readyForDrawSPCCharts();
      },

      simulateInitData() {
        this.spcFeaturesArr = ["wind_direction", "generator_speed"];
        this.showAtTheSameTimeSpotNums = 9;
        this.chartDateTimeArr = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
        this.latestAllDataArr = [[5, 30, 50, 45, 60, 20, 55, 33, 105], [6, 32, 45, 51, 38, 99, 45, 59, 28]];
        this.latestAllCa = [11, 12];
        this.latestAllCp = [13, 20];
        this.latestAllCpk = [15, 18];
        this.user_all_usls = [95, 90];
        this.user_all_lsls = [5, 11];
        this.user_all_means = [45, 39];
        this.user_all_sigmas = [27, 10];

        this.d('tempHinterLayer').style.display = "none";

        this.preDefineColorArr = [];
        for (var i = 0; i < this.spcFeaturesArr.length; i++) {
          this.preDefineColorArr.push(this.randomHexColor());
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
        this.sendBackAfterSomeParasChanged(0);
      },

      sendBackAfterSomeParasChanged(chartIndex) {
        //alert("this.user_all_usls[chartIndex]="+this.user_all_usls[chartIndex])
        if (this.simulateDemoFlag) return;
        let newObj = {};
        newObj.initcfg = 0;
        newObj.num = this.showAtTheSameTimeSpotNums;
        newObj.idx = chartIndex;
        newObj.user_usl = this.user_all_usls[chartIndex]
        newObj.user_lsl = this.user_all_lsls[chartIndex]


        this.ws.send(JSON.stringify(newObj));
      },

      execInitSendAction() {
        if (this.simulateDemoFlag) return;
        let initSender = '{"initcfg":1}';
        this.ws.send(initSender);
      },
      updateReceivedData(recvData) {
        console.log('recvdata:', recvData);
        this.d('tempHinterLayer').style.display = "none";

        if (recvData.indexOf("datetime") > -1) {

          let realData = JSON.parse(recvData);

          this.chartDateTimeArr.push(realData.datetime);

          this.latestAllDataArr.push(realData.data);

          this.latestAllCa = realData.Ca.split(",");

          this.latestAllCp = realData.Cp.split(",");

          this.latestAllCpk = realData.Cpk.split(",");

          if (this.latestAllDataArr.length > this.showAtTheSameTimeSpotNums) {
            this.chartDateTimeArr.shift();
            this.latestAllDataArr.shift();
          }

        }

        if (recvData.indexOf("FeatureList") > -1) {
          let basicSetupData = JSON.parse(recvData);
          this.showAtTheSameTimeSpotNums = Number(basicSetupData.NUM);
          this.spcFeaturesArr = basicSetupData.FeatureList.split(",");
          this.user_all_usls = basicSetupData.USL.split(",");
          this.user_all_lsls = basicSetupData.LSL.split(",");
          this.user_all_means = basicSetupData.mean.split(",");
          this.user_all_sigmas = basicSetupData.sigma.split(",");
          this.preDefineColorArr = [];
          for (var i = 0; i < this.spcFeaturesArr.length; i++) {
            this.preDefineColorArr.push(this.randomHexColor());
          }
        }

        this.readyForDrawSPCCharts();

      },


      readyForDrawSPCCharts() {

        for (var k = 0; k < this.spcFeaturesArr.length; k++) {

          let currentChart = echarts.init(this.d('chart_' + k));

          this.d('chart_' + k).width = document.body.offsetWidth - 320 + "px";

          let featureName = this.spcFeaturesArr[k];

          let usl_markline_value = new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_usls[k]);

          let lsl_markline_value = new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_lsls[k]);

          let mean_middle_markline_value = new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_means[k]);

          let mean_high_markline_value = new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_means[k] + this.user_all_sigmas[k]);

          let mean_low_markline_value = new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_means[k] - this.user_all_sigmas[k]);

          let time_data_arr = this.chartDateTimeArr;

          // let real_data_arr = this.recombineMapArr(k);
          let real_data_arr;

          if (this.simulateDemoFlag) {
            real_data_arr = this.latestAllDataArr[k];
          } else {
            real_data_arr = this.recombineMapArr(k);
          }

          let pointedColor = this.preDefineColorArr[k];

          currentChart.resize();

          currentChart.setOption(this.getAimOptionForECharts(pointedColor, currentChart.getWidth() - this.chartLeftMarginBlankWidth - this.chartRightMarginBlankWidth, featureName, time_data_arr,
            real_data_arr, usl_markline_value, lsl_markline_value, mean_middle_markline_value, mean_high_markline_value, mean_low_markline_value), true);

        }

        this.chartWholeShowFlag = true;
      },

      recombineMapArr(index) {
        let arr = [];
        for (var i = 0; i < this.latestAllDataArr.length; i++) {
          arr.push(this.latestAllDataArr[i][index]);
        }
        return arr;
      },

      getAimOptionForECharts(pointedColor,chartRealWidth, featureName, time_data_arr, real_data_arr, usl, lsl, mean_middle, mean_high, mean_low) {
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
              fontFamily:'Verdana'
            }
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
            axisLabel: {
              interval: 'auto',
              showMinLabel: true,
              showMaxLabel: true,
              align: 'center',
              inside: false,
              textStyle: {
                color: '#000'
              }
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
          series: [{
            name: featureName,
            type: 'line',
            symbol: 'none',
            data: real_data_arr
          },
            {
              name: 'USL',
              type: 'line',
              symbol: 'none',
              data: usl,
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
                  formatter: 'USL'
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
              symbol: 'none',
              data: lsl,
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
                  formatter: 'LSL'
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
              symbol: 'none',
              data: mean_high,
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
                  formatter: 'mean+3σ'
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
              symbol: 'none',
              data: mean_middle,
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
                  formatter: 'mean'
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
              symbol: 'none',
              data: mean_low,
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
                  formatter: 'mean-3σ'
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
