webpackJsonp([1],{"+skl":function(t,e){},"4bFZ":function(t,e){Date.prototype.Format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var s in/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t},Array.prototype.in_array=function(t){for(i=0;i<this.length&&this[i]!=t;i++);return!(i==this.length)},String.prototype.myReplace=function(t,e){var s=new RegExp(t,"g");return this.replace(s,e)},String.prototype.trim=function(){return this.replace(/(^\s*)|(\s*$)/g,"")}},E4za:function(t,e){},NHnr:function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=s("7+uW"),a=s("mvHQ"),r=s.n(a),n=s("XLwt"),o=s.n(n),l={name:"App",props:[],data:function(){return{spcFeaturesAddAllOptionArr:[],currentViewFeaturesList:[],ws:null,myChart:null,spcFeaturesArr:[],showAtTheSameTimeSpotNums:5,chartIndex:0,chartDateTimeArr:[],latestAllDataArr:[],latestAllCa:[],latestAllCp:[],latestAllCpk:[],user_all_usls:[],user_all_lsls:[],user_all_means:[],user_all_sigmas:[],chartLeftMarginBlankWidth:70,chartRightMarginBlankWidth:150,simulateDemoFlag:!1,chartWholeShowFlag:!1,houxuanColors:[],bak_spcFeaturesArr:[],initFirstFlag:!0}},watch:{currentViewFeaturesList:function(t,e){this.renewDrawCharts()}},mounted:function(){var t="ws://"+window.location.host+"/",e="MozWebSocket"in window?MozWebSocket:WebSocket,s=this;this.ws=new e(t),this.ws.onerror=function(t){console.log(t)},this.ws.onmessage=function(t){s.updateReceivedData(t.data)},this.ws.onprob=function(){console.log("Socket connection probd")},this.ws.onopen=function(){console.log("Socked Connected OK"),s.execInitSendAction()},window.onresize=this.rearrangeShowElementsByWindowResize,this.houxuanColors=[],this.houxuanColors[0]="#008000",this.houxuanColors[1]="#FFA500",this.houxuanColors[2]="#FF4500",this.houxuanColors[3]="#9400D3",this.houxuanColors[4]="#7B68EE",this.houxuanColors[5]="#008B8B",this.houxuanColors[6]="#8B4513",this.houxuanColors[7]="#0887FF",this.houxuanColors[8]="#808000",this.houxuanColors[9]="#8B0000",this.houxuanColors[10]="#5F9EA0";var i=this.houxuanColors.map(function(t){return t});this.houxuanColors=this.houxuanColors.concat(i),this.simulateInitData()},methods:{ddddd:function(t){if(t.find(function(t){return"--All Features--"==t})){if("--All Features--"==t[0]&&t.length>1&&t.shift(),"--All Features--"==t[t.length-1]&&t.length>1)for(;t.length>1;)t.shift()}else 0==t.length&&t.push();console.log(this.currentViewFeaturesList)},renewDrawCharts:function(){console.log("this.initFirstFlag="+this.initFirstFlag),this.initFirstFlag||(1==this.currentViewFeaturesList.length&&"--All Features--"==this.currentViewFeaturesList[0]?this.spcFeaturesArr=this.bak_spcFeaturesArr.map(function(t){return t}):this.spcFeaturesArr=this.currentViewFeaturesList.map(function(t){return t}),console.log("-----"+this.spcFeaturesArr.toString()),setTimeout(this.readyForDrawSPCCharts,500))},selectHighlightInputContent:function(t){(window.event||t).target.select()},rearrangeShowElementsByWindowResize:function(){this.readyForDrawSPCCharts()},simulateInitData:function(){this.spcFeaturesArr=["wind_direction","generator_speed"],this.bak_spcFeaturesArr=["wind_direction","generator_speed"],this.spcFeaturesAddAllOptionArr=["--All Features--"];for(var t=0;t<this.spcFeaturesArr.length;t++)this.spcFeaturesAddAllOptionArr.push(this.spcFeaturesArr[t]);this.currentViewFeaturesList=["--All Features--"],this.showAtTheSameTimeSpotNums=9,this.chartDateTimeArr=["12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00"],this.latestAllDataArr=[[-5.2424242,-30.4214124,-50.254235,45.85687,60.745657,20.474747467,55.74747476,33.4745757,105.74674747],[6.7476747,32.74767475,45.74764747,51.74657475,-38.4775757,99.747657757,45.74757457,59.7456757,28.435323]],this.latestAllCa=[11.3455666,12.56789].map(function(t){return t.toFixed(2)}),this.latestAllCp=[13.45667,20.76575].map(function(t){return t.toFixed(2)}),this.latestAllCpk=[15.41431,18.523453253].map(function(t){return t.toFixed(2)}),this.user_all_usls=[95,90],this.user_all_lsls=[-10,-30],this.user_all_means=[45.63465464356,39.634564].map(function(t){return Number(t.toFixed(2))}),this.user_all_sigmas=[27.63645636,10.9999988888].map(function(t){return Number(t.toFixed(2))}),this.d("tempHinterLayer").style.display="none",this.preDefineColorArr=[];for(t=0;t<this.spcFeaturesArr.length;t++)this.preDefineColorArr.push(this.houxuanColors[t]);this.simulateDemoFlag=!0,setTimeout(this.readyForDrawSPCCharts,1e3)},randomHexColor:function(){return"#"+("00000"+(16777216*Math.random()<<0).toString(16)).substr(-6)},readyForUpdateNumValue:function(){this.sendBackAfterSomeParasChanged(0)},sendBackAfterSomeParasChanged:function(t){var e={initcfg:0};e.num=this.showAtTheSameTimeSpotNums,e.idx=t,e.user_usl=this.user_all_usls[t],e.user_lsl=this.user_all_lsls[t],this.ws.send(r()(e))},execInitSendAction:function(){this.ws.send('{"initcfg":1}')},updateReceivedData:function(t){console.log("recvdata:",t)},readyForDrawSPCCharts:function(){for(var t=0;t<this.spcFeaturesArr.length;t++){var e=o.a.init(this.d("chart_"+t));this.d("chart_"+t).width=document.body.offsetWidth-320+"px";var s=this.spcFeaturesArr[t],i=new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_usls[t]),a=new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_lsls[t]),r=new Array(Number(this.showAtTheSameTimeSpotNums)).fill(this.user_all_means[t]),n=new Array(Number(this.showAtTheSameTimeSpotNums)).fill((this.user_all_means[t]+this.user_all_sigmas[t]).toFixed(2)),l=new Array(Number(this.showAtTheSameTimeSpotNums)).fill((this.user_all_means[t]-this.user_all_sigmas[t]).toFixed(2)),h=this.chartDateTimeArr,u=void 0;u=this.simulateDemoFlag?this.latestAllDataArr[t]:this.recombineMapArr(t);var c=this.highlightBeyondUSLOrLSLData(u,i[0],a[0]),p=this.preDefineColorArr[t];e.resize(),e.setOption(this.getAimOptionForECharts(c,p,e.getWidth()-this.chartLeftMarginBlankWidth-this.chartRightMarginBlankWidth,s,h,u,i,a,r,n,l),!0),setTimeout(this.delay3SecondsReviseAnimation,3e3,e)}this.chartWholeShowFlag=!0,this.initFirstFlag=!1},highlightBeyondUSLOrLSLData:function(t,e,s){for(var i=[],a=0;a<t.length;a++)(t[a]>e||t[a]<s)&&i.push({coord:[a,t[a]]});return i},recombineMapArr:function(t){for(var e=[],s=0;s<this.latestAllDataArr.length;s++)e.push(this.latestAllDataArr[s][t]);return e},delay3SecondsReviseAnimation:function(t){t.setOption({animation:!0})},getAimOptionForECharts:function(t,e,s,i,a,r,n,o,l,h,u){return this.option={title:{text:""},tooltip:{trigger:"axis",extraCssText:"letter-spacing:1px",borderColor:"#777777",borderWidth:1,backgroundColor:"rgba(255,255,224,0.7)",textStyle:{color:"#000",align:"left",fontFamily:"Verdana"},formatter:"{b0}<br />{a0}:{c0}"},legend:{itemHeight:7,itemWidth:15,data:[{name:i,icon:"rect"}],textStyle:{fontSize:14}},grid:{left:this.chartLeftMarginBlankWidth,right:this.chartRightMarginBlankWidth,top:45,bottom:45},animation:!1,color:[e,"#7f7f7f","#7f7f7f","#7f7f7f","#7f7f7f","#7f7f7f"],xAxis:[{name:"",nameGap:10,boundaryGap:!1,data:a,axisLine:{onZero:!1},axisLabel:{interval:"auto",showMinLabel:!0,showMaxLabel:!0,align:"center",inside:!1,textStyle:{color:"#000"}},splitLine:{show:!1}}],yAxis:[{name:"",nameTextStyle:{width:"100%"},type:"value",splitLine:{show:!1}}],series:[{name:i,type:"line",symbol:"roundRect",symbolSize:10,showSymbol:!1,lineStyle:{width:3},data:r,markPoint:{symbol:"circle",symbolSize:12,data:t,animation:!0,animationDuration:500}},{name:"USL",type:"line",data:n,symbol:"none",lineStyle:{width:2},markPoint:{symbol:"circle",symbolSize:1,symbolOffset:[s,0],label:{show:!0,color:"#000",fontSize:14,align:"left",padding:[0,0,0,15],formatter:"USL : "+n[0]},data:[{type:"max"}]}},{name:"LSL",type:"line",data:o,symbol:"none",lineStyle:{width:2},markPoint:{symbol:"circle",symbolSize:1,symbolOffset:[s,0],label:{show:!0,color:"#000",fontSize:14,align:"left",padding:[0,0,0,15],formatter:"LSL : "+o[0]},data:[{type:"max"}]}},{name:"mean+3σ",type:"line",data:h,symbol:"none",lineStyle:{width:1,type:"dashed"},markPoint:{symbol:"circle",symbolSize:1,symbolOffset:[s,0],label:{show:!0,color:"#000",fontSize:14,align:"left",padding:[0,0,0,15],formatter:"UCL : "+h[0]},data:[{type:"max"}]}},{name:"mean",type:"line",data:l,symbol:"none",lineStyle:{width:1,type:"dashed"},markPoint:{symbol:"circle",symbolSize:1,symbolOffset:[s,0],label:{show:!0,color:"#000",fontSize:14,align:"left",padding:[0,0,0,15],formatter:"MEAN : "+l[0]},data:[{type:"max"}]}},{name:"mean-3σ",type:"line",data:u,symbol:"none",lineStyle:{width:1,type:"dashed"},markPoint:{symbol:"circle",symbolSize:1,symbolOffset:[s,0],label:{show:!0,color:"#000",fontSize:14,fontFamily:"Microsoft YaHei",align:"left",padding:[0,0,0,15],formatter:"LCL : "+u[0]},data:[{type:"max"}]}}]},this.option}}},h={render:function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{attrs:{id:"app"}},[t._m(0),t._v(" "),t._m(1),t._v(" "),s("div",{staticClass:"m-huabu",attrs:{id:"container"}},[s("div",{directives:[{name:"show",rawName:"v-show",value:t.spcFeaturesArr.length>0,expression:"spcFeaturesArr.length>0"}],attrs:{id:"sonTitle"}},[s("span",[t._v("自定义同时显示数据点的数量：\n      "),s("Input",{staticStyle:{width:"40px"},on:{"on-focus":t.selectHighlightInputContent},model:{value:t.showAtTheSameTimeSpotNums,callback:function(e){t.showAtTheSameTimeSpotNums=e},expression:"showAtTheSameTimeSpotNums"}}),t._v(" 个\n      "),s("Button",{staticClass:"m-updateNumBtn",attrs:{size:"default",type:"primary"},on:{click:t.readyForUpdateNumValue}},[t._v("点击更新")])],1)]),t._v(" "),t._l(t.spcFeaturesArr,function(e,i){return s("div",[s("hr",{staticStyle:{"margin-top":"20px","margin-bottom":"20px",height:"1px",border:"none","border-top":"1px ridge gray"}}),t._v(" "),s("br"),t._v(" "),s("div",{staticClass:"m-spcChart",attrs:{id:"chart_"+i}}),t._v(" "),s("div",{directives:[{name:"show",rawName:"v-show",value:t.chartWholeShowFlag,expression:"chartWholeShowFlag"}]},[s("span",{staticClass:"m-ca-cp-cpk-label"},[s("span",{staticClass:"u-onec-label"},[t._v("Ca: "+t._s(t.latestAllCa[i]))]),t._v(" "),s("span",{staticClass:"u-onec-label"},[t._v("Cp: "+t._s(t.latestAllCp[i]))]),t._v(" "),s("span",{staticClass:"u-onec-label"},[t._v("Cpk: "+t._s(t.latestAllCpk[i]))])]),t._v(" "),s("span",{staticClass:"m-usl-lsl-label"},[t._v("\n              自定义 —— LSL: "),s("Input",{staticStyle:{width:"40px","margin-right":"20px"},on:{"on-focus":t.selectHighlightInputContent},model:{value:t.user_all_lsls[i],callback:function(e){t.$set(t.user_all_lsls,i,e)},expression:"user_all_lsls[index]"}}),t._v("USL:\n          "),s("Input",{staticStyle:{width:"40px"},on:{"on-focus":t.selectHighlightInputContent},model:{value:t.user_all_usls[i],callback:function(e){t.$set(t.user_all_usls,i,e)},expression:"user_all_usls[index]"}}),t._v(" "),s("Button",{staticClass:"m-updateUSLAndLSLBtn",attrs:{size:"default",type:"primary"},on:{click:function(e){t.sendBackAfterSomeParasChanged(i)}}},[t._v("\n              点击更新\n            ")])],1)]),t._v(" "),s("br"),t._v(" "),s("br")])}),t._v(" "),s("br"),t._v(" "),s("br")],2)])},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"titlelay"},[e("div",{staticClass:"titleinner",attrs:{id:"titleinner"}},[this._v("\n      　SPC实时数据状态图\n    ")])])},function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"tempHinterLayer",attrs:{id:"tempHinterLayer"}},[e("div",{staticClass:"tempHinterInner"},[this._v("\n      　（暂时没有收到数据发送）\n    ")])])}]};var u=s("VU/8")(l,h,!1,function(t){s("TlsI")},null,null).exports,c=s("BTaQ"),p=s.n(c),d=(s("+skl"),{render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("div",[e("div",{attrs:{id:"circleLoadingContainer"}},[e("div",{staticClass:"loadEffect"},[e("span"),this._v(" "),e("span"),this._v(" "),e("span"),this._v(" "),e("span"),this._v(" "),e("span"),this._v(" "),e("span"),this._v(" "),e("span"),this._v(" "),e("span")])])])}]});var m=s("VU/8")(null,d,!1,function(t){s("E4za")},"data-v-a2bd781a",null).exports,f={install:function(t){t.component("circleLoading",m)}};s("BO1k"),s("fZjL"),s("pFYg");var g={mixin:function(t,e){for(var s in e)e.hasOwnProperty(s)&&(t[s]=e[s]);return t},d:function(t){return document.getElementById(t)},tranFirstLetterUpperPresent:function(t){if(""==t)return"";var e=t.slice(0,1),s=t.slice(1);return e.toUpperCase()+s},getCurrentDateAndTime:function(){var t=new Date,e=t.getMonth()+1,s=t.getDate(),i=t.getHours(),a=t.getMinutes();return e>=1&&e<=9&&(e="0"+e),s>=0&&s<=9&&(s="0"+s),i>=0&&i<=9&&(i="0"+i),a>=0&&a<=9&&(a="0"+a),t.getFullYear()+"-"+e+"-"+s+" "+i+":"+a}},_=g;s("4bFZ");i.default.config.productionTip=!1,i.default.use(p.a),i.default.use(f),i.default.prototype.d=_.d,i.default.prototype.tranFirstLetterUpperPresent=_.tranFirstLetterUpperPresent,i.default.prototype.getCurrentDateAndTime=_.getCurrentDateAndTime,new i.default({el:"#app",components:{App:u},template:"<App/>"})},TlsI:function(t,e){}},["NHnr"]);
//# sourceMappingURL=app.ea4677ba68f6fec5fa62.js.map