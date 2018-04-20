// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import circleLoading from './components/circle-loading';
import utils from './util';
import './util/any';

Vue.config.productionTip = false; // 阻止 vue 在启动时生成生产提示

Vue.use(circleLoading);

Vue.prototype.d = utils.d;
Vue.prototype.tranFirstLetterUpperPresent = utils.tranFirstLetterUpperPresent;
Vue.prototype.getCurrentDateAndTime = utils.getCurrentDateAndTime;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
