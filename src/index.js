import './index.scss'
import CircleProgress from './circle-progress.js'

// 创建圆形进度条
new CircleProgress({
  el: document.getElementById('j-my-progress'),
  value: 0.75,
  animation: {
    duration: 600,
    progress: v => {
      document.getElementById('j-my-progress-info').innerHTML = v
    }
  },
  size: 100,
  thickness: 5,
  lineCap: 'round',
  fill: {
    // image: require('./images/gradient.png')
    gradientAngle: (Math.PI * 7) / 6,
    gradient: ['#fdb591', '#fdb591', '#ef6861', '#e30011', '#e30011']
  },
  emptyFill: '#fcf2f3'
})
