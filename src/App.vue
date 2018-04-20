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

    <div id="container" class="m-huabu"></div>
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
        myChart: null
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
        ownerparent.execSendAction();
      };

      this.myChart = echarts.init(this.d('container'));
    },

    methods: {
      execSendAction(){
        this.ws.send('hello, 这是前端发过来的消息 message from frontback');
      },
      updateReceivedData(recvData) {
        console.log('recvdata:', recvData);
        this.d('tempHinterLayer').style.display = "none";
      }
    },
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 50px;
  }

  .titlelay {
    width: 100%;
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
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
    width: auto;
    height: 400px;
    margin-left: 100px;
    margin-right: 100px;
  }


</style>
