<template>
  <div class="par-box" >
    <el-scrollbar style="height: 100%;" class="big-scroll">
    <div class="demo-top">
      <!-- <i class="el-icon-arrow-left goback" @click="goBack"></i> -->
      <img src="../../../assets/images/index/building-icon.png" alt="">
      <h6>博智林总部大楼 > {{organizationName}}栋</h6>
    </div>
    <!-- <el-scrollbar style="height:100%" class="par-scroll"> -->
      <div class="robot-container">
        <dl class="floor-in-build">
          <dt>楼层</dt>
            <div class="floor-box">

              <dd v-for="(item, idx) in floorList" :key="idx" @click="changeFloorIdx(idx,item.mapId)"><span :class="floorChoose==idx?'active':''">{{ item.floor }}</span> <i class="el-icon-caret-right" v-show="floorChoose==idx"></i></dd>
            </div>
        </dl>

        <!-- 画布 -->
        <div class="map-cantain">
          <canvas id="canvas" :width="canvasW" :height="canvasH"></canvas>
          <!-- 电梯 -->
          <div class="lift-box" v-show="animate">
            <div class="lift">
              <div class="lift-head">
                <p v-show="active=='up'" :class="['up',animate ? 'move-up' : '' ]"></p>
                <p v-show="active=='down'" :class="['down',animate ? 'move-down' : '']"></p>
                <p>{{floor}}&nbsp;F</p>
              </div>
              <div class="lift-foot">
                <p></p>
                <div>
                  <img src="../../../assets/images/index/robot.png" alt="">
                </div>
              </div>
            </div>
          </div>
          <!-- 图标说明 -->

          <div class="map-icon-desc" v-show="toolObj.toolChooseIcon!==2">
            <dl>
              <dt>
                <h6>图标说明</h6>
              </dt>
              <dd><img src="../../../assets/images/index/station1.png" alt=""> 工作站</dd>
              <dd><img src="../../../assets/images/index/station4.png" alt=""> 工作站前方</dd>
              <dd><img src="../../../assets/images/index/station2.png" alt=""> 工作站补给点</dd>
              <dd class="station"><img src="../../../assets/images/index/station3.png" alt=""> 工作站待机点</dd>
              <dd><img src="../../../assets/images/index/elevator3.png" alt=""> 呼梯待机点</dd>
              <dd><img src="../../../assets/images/index/elevator1.png" alt=""> 乘梯点</dd>
              <dd class="elevation"><img src="../../../assets/images/index/elevator2.png" alt=""> 出梯点</dd>
              <dd><img src="../../../assets/images/index/map-out.png" alt=""> 地图入口</dd>
              <dd class="map-out"><img src="../../../assets/images/index/map-in.png" alt=""> 地图出口</dd>
            </dl>
          </div>
          <!-- 左上角工具箱 -->

          <div class="magnifier" v-show="bottomMap">
            <img src="../../../assets/images/map/bigicon.png" class="scale-icon" @click.stop="scale(1)">
            <img src="../../../assets/images/map/smallicon.png" class="scale-icon" @click.stop="scale(-1)">
            <span class="tool-icon">
              <span @click="changeShowToolBox">
                <img src="../../../assets/images/index/tool-icon.png"><span>工具箱</span>
                <i class="el-icon-arrow-down" v-if="showToolBox"></i><i class="el-icon-arrow-up" v-else></i>
              </span>
              <ul class="choose-drop" v-show="showToolBox">

                <li v-for="(item,idx) in toolDesc" :key="idx" :class="toolObj.toolChooseAll==idx||toolObj.toolChooseFocus==idx||toolObj.toolChooseIcon==idx?'active':''" @click="changeTool(idx)"><i class="el-icon-check" v-show="toolObj.toolChooseAll==idx||toolObj.toolChooseFocus==idx||toolObj.toolChooseIcon==idx"></i>{{item}}</li>
              </ul>
            </span>
          </div>

          <div class="robot-message" v-show="canvasActiveRobot.showMessage" :style="{'top':canvasActiveRobot.top,'left':canvasActiveRobot.left}">
             <h6>

              <p>名称: {{ canvasActiveRobot.name }}</p>
              <p>id: {{  canvasActiveRobot.id }}</p>
             </h6>
          </div>

        </div>

        <!-- 机器人集合 -->
        <div class="robot-group">
          <ul class="robot-roup-ul">
            <li v-for="(item,idx) in robotIdArr" :key="idx" :class="['robot-roup-li',item.isMqttState?'':'robot-model',activeRobot==item.robotId?'li-active-robot':'']">
              <div class="left">
                <div class="left-img" :style="{'border-color': item.robotStatus ? item.color : '#ccc' }">
                  <img src="../../../assets/images/index/robot-back.png" alt="">
                </div>

                <span class="robot-status-text">{{ item.robotStatus ? "在线" : "离线" }}</span>
                <!-- <span class="robot-status-text">{{robotStatusArrTag[item.robotStatus]}}</span> -->
              </div>
              <div class="right">
                <p class="robot-name">
                  <span>{{ item.robotName }}</span>
                  <img :src="activeRobot==item.robotId ? starFocus : starIcon" alt="" @click="changeRobotIdx(idx,item.mapId,item.robotId,item.robotStatus)">
                </p>
                <p class="robot-id">{{item.robotId}}</p>
                <p class="work-progress"><el-progress :percentage="item.taskProcess" :color="item.color"></el-progress></p>
                <ul class="robot-status">
                  <li>
                    <el-progress :show-text="false" :percentage="item.batteryRemain" class="battery-gress"></el-progress><i></i>
                    <span class="battery-text">{{ item.batteryRemain?item.batteryRemain+'%':'-' }}</span>
                  </li>
                  <li>

                    <el-tooltip class="item" effect="dark" content="清水箱" placement="top">
                      <img src="@/assets/images/work/clean-water.png" alt="">
                    </el-tooltip>
                    <span>{{ item.cleanWater?item.cleanWater:'-' }}</span>
                  </li>
                  <li>
                    <el-tooltip class="item" effect="dark" content="污水箱" placement="top">
                    <img src="@/assets/images/work/dirty-water.png" alt="">
                    </el-tooltip>
                    <span>{{ item.dirtyWater?item.dirtyWater:'-' }}</span>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>

import { fabric } from 'fabric'
import { bottomImg, mapAndRobot, getMessage, getfloorMap } from '@/api/clean-robot/map.js'
import { toEulerAngle, getDegree } from '../../../util/point.js'
import { throttle } from 'lodash'
const robotIcon = require('@/assets/images/index/robot-direction-icon.png')
const robotStar = require('@/assets/images/index/starRobot.png')
export default {
  name: '',
  data () {
    return {
      floorChoose: '',
      toolObj: {
        toolChooseAll: 0, //默认选中所有机器人路径
        toolChooseFocus: -1, //选中焦点机器人
        toolChooseIcon: -1 //默认隐藏图标说明
      },
      showToolBox: false,
      organizationName: 'A',
      floorList: [],
      robotIds: [], // 当前楼层上的机器人
      robotIdArr: [], //楼栋中所有的机器人
      // robotIdArr: [{ robotId: 'AAAAAAAAAAAAAAAA', robotName: 'R001', taskProcess: 90, batteryRemain: 100, cleanWater: '正常', dirtyWater: '正常', robotStatus: 1 }], //楼栋中所有的机器人
      starFocus: require('../../../assets/images/index/star1.png'),
      starIcon: require('../../../assets/images/index/star2.png'),
      // robotStatusArrTag: ['待机', '自动清扫', '手动清扫', '补给中', '乘梯中', '建图中', '故障', '离线'],
      toolDesc: ['显示路径', '只显示焦点机器人', '隐藏图标说明'],
      floor: '', // 电梯楼层
      active: '', // 显示动画
      animate: false, //是否显示电梯提示（机器人切换楼层上下行的时候才显示）
      // mapId: '',
      mapId: '',
      robotId: '00000000000000000012',
      canvasH: '764.73px',
      canvasW: '700px',
      resolutionX: 0.02,
      resolutionY: 0.02,
      mapOrigin: {
        width: '',
        height: ''
      },
      pressOrigin: {
        x: '',
        y: ''
      },
      scalePercent: {
        left: 0,
        top: 0,
        x: '', // 原始的width的比例
        y: '', // 原始的height的比例
        now: 0,
        before: ''
      },
      bottomMap: '',
      elevatorStatusMqtt: '',
      robotStatusMqtt: '',
      drawArea: '', // canvas画布对象
      mqtt: '',
      messageList: {
        robot: {},
        lift: {}
      },
      messageBox: [],
      drawShape: {
        robot: {}, // 绘制的机器人列表
        line: {} // 绘制的路径列表
      },
      robotImg: '',
      starImg: '',
      robotColor: {
        useColor: [],
        notUseColor: ['#a610c0', '#ff7ed6', '#ff9216', '#af5000', '#3bba00', '#00c2e0', '#4157ff', '#F0E68C', '#B0C4DE']
        // notUseColor: ['#5F9EA0', '#FF9016','#F0E68C', '#E9967A', '#F08080', '#8A2BE2','#4169E1','#B0C4DE','#98FB98']
      },
      activeRobot: '',
      showLine: true,
      showActiveRobot: false,
      base64: '',
      historyLine: { }, // 历史路径
      canvasActiveRobot: {
        activeLength: 0,
        showMessage: false,
        id: '',
        name: '',
        top: 0,
        left: 0
      },
      stopRender: {
          move:false,
          scale:false
      }
    }
  },
  created() {
    this.getIconImg()
  },
  async mounted() {
    await this.getFloor()
    await this.getrobotList()
    const handleMouse = throttle(event => {
      const { pointer, e } = event
      this.scale(-e.deltaY)
    }, 50)
    this.drawArea = new fabric.Canvas('canvas', { selection: null })
    this.drawArea.on('mouse:down', this.mouseDown)
    this.drawArea.on('mouse:move', this.mouseMove)
    this.drawArea.on('mouse:up', this.mouseUp)
    this.drawArea.on('mouse:wheel', e => {
      handleMouse(e)
    })
    await this.getBottomImg()
    this.mqttStart()
    const loginUserId = JSON.parse(localStorage.getItem('robot_userInfo')).id
    if (JSON.parse(localStorage.getItem('toolObj')).UserId == loginUserId) {
      this.toolObj = JSON.parse(localStorage.getItem('toolObj'))
      this.activeRobot = this.toolObj.activeRobot
    }

    const activeRobot = JSON.parse(localStorage.getItem('toolObj')).activeRobot
    this.robotIdArr.forEach(e => { //当上次设定的焦点机器人在线，本次焦点机器人还是ta，并且记录上一次工具箱选择
      console.log(e)
      if (!activeRobot) {
        this.toolObj.toolChooseFocus = -1
      }
      if (e.robotId == activeRobot && !e.robotStatus) {
        this.toolObj.activeRobot = ''
        this.toolObj.toolChooseFocus = -1
      }
    })
  },
  beforeDestroy() {
    this.mqtt.subArr.forEach(item => {
      this.mqtt.unsub(item)
    })
    this.mqtt.disconnect()
  },
  methods: {
    getIconImg() {
      const robot = new Image()
      robot.src = robotIcon
      robot.onload = () => {
        this.robotImg = robot
      }
      const star = new Image()
      star.src = robotStar
      star.onload = () => {
        this.starImg = star
      }
    },
    //切换楼层
    changeFloorIdx(idx, mapId) {
      if (this.floorChoose === idx) { //点击当前楼层不处理
        return
      }
      if (!mapId) {
        this.$message.error('没有获取到楼层地图,请稍后再试')
        return
      }
      this.activeRobot = '' //清空焦点机器人
      this.floorChoose = idx
      this.mapId = mapId
      this.drawArea.clear() //清除画布中所有对象
      this.getBottomImg()
      // 仅清除机当前机器人位置订阅
      this.mqtt.subArr.forEach(item => {
        if (item.indexOf('position') > -1) {
          this.mqtt.unsub({ topic: item })
        }
      })
      // console.log(this.mqtt.subArr)
      // 清除数据
      this.drawShape = {
        robot: {},
        line: {}
      }
      this.mqtt.messageArr = []
      // 清空颜色
      this.resetColor()
      //楼层上的机器人
      const arr = []
      this.robotIdArr.forEach(e => { //筛选选中楼层地图上的机器人
        if (e.mapId === mapId) {
          arr.push(e.robotId)
          this.subRobotPosi(true, e.robotId)
        }
      })
      this.robotIds = arr
    },


    // 切换工具箱选项（选项不互斥）
    changeTool(idx) {
      if (idx === 0) {
        this.toolObj.toolChooseAll = this.toolObj.toolChooseAll == idx ? -1 : 0
        this.showLine = this.toolObj.toolChooseAll != -1
      }
      if (idx === 1) {
        if (!this.activeRobot) {
          this.$message.error('请先选择焦点机器人')
          return
        }
        this.toolObj.toolChooseFocus = this.toolObj.toolChooseFocus == idx ? -1 : 1
        this.showActiveRobot = this.toolObj.toolChooseFocus != -1
      }
      if (idx === 2) {
        this.toolObj.toolChooseIcon = this.toolObj.toolChooseIcon == idx ? -1 : 2
      }

      this.toolObj.UserId = JSON.parse(localStorage.getItem('robot_userInfo')).id
      localStorage.setItem('toolObj', JSON.stringify(this.toolObj))

      // 1. ① √   ②×     显示地图上所有机器人图标以及其路径
      // 2. ① √   ②√     只显示焦点机器人图标以及其路径
      // 3. ① ×   ②√     只显示焦点机器人图标，地图上没有任何路径
      // 4. ① ×   ②×     只显示地图上所有机器人的图标，地图上没有任何路径
      if (this.toolObj.toolChooseAll == 0) {
        if (this.toolObj.toolChooseFocus == 1) { //只显示焦点机器人图标以及其路径
          for (const i in this.drawShape.line) {
            if (this.activeRobot !== i && this.drawShape.line[i].el) {
              this.drawShape.line[i].el.set('opacity', 0)
            }
          }
          for (const i in this.drawShape.robot) {
            if (this.activeRobot !== i && this.drawShape.robot[i].el) {
              this.drawShape.robot[i].el.set('opacity', 0)
            }
          }
          this.drawArea.renderAll()
        } else { //显示地图上所有机器人图标以及其路径
          for (const i in this.drawShape.line) {
            if (this.activeRobot !== i && this.drawShape.line[i].el) {
              this.drawShape.line[i].el.set('opacity', 1)
            }
          }
          for (const i in this.drawShape.robot) {
            if (this.activeRobot !== i && this.drawShape.robot[i].el) {
              this.drawShape.robot[i].el.set('opacity', 1)
            }
          }
          this.drawArea.renderAll()
        }
      } else {
        for (const i in this.drawShape.line) {
          if (this.drawShape.line[i].el) {
            this.drawShape.line[i].el.set('opacity', 0)
          }
        }
        this.drawArea.renderAll()


        if (this.toolObj.toolChooseFocus == 1) { //只显示焦点机器人图标，地图上没有任何路径
          for (const i in this.drawShape.robot) {
            if (this.activeRobot !== i && this.drawShape.robot[i].el) {
              this.drawShape.robot[i].el.set('opacity', 0)
            }
          }
          this.drawArea.renderAll()
        } else { // 只显示地图上所有机器人的图标，地图上没有任何路径
          for (const i in this.drawShape.robot) {
            if (this.activeRobot !== i && this.drawShape.robot[i].el) {
              this.drawShape.robot[i].el.set('opacity', 1)
            }
          }
          this.drawArea.renderAll()
        }
      }
    },

    // 点击工具箱显示选项
    changeShowToolBox() {
      if (this.showToolBox) {
        this.showToolBox = false
      } else {
        this.showToolBox = true
      }
    },
    getColor() {
      const color = this.robotColor.notUseColor[0]
      this.robotColor.useColor.push(color)
      this.robotColor.notUseColor.splice(0, 1)
      return color
    },
    resetColor() {
      this.robotColor.useColor = []
      this.robotColor.notUseColor = ['#FF9016', '#4169E1', '#5F9EA0', '#98FB98', '#F0E68C', '#E9967A', '#F08080', '#8A2BE2', '#B0C4DE']
    },
    //切换机器人
    async changeRobotIdx(idx, mapId, robotId, status) {
      // 选中对应机器人，然后查询机器人所在楼层，然后查询机器人所在楼层的所有机器人id
      if (!status) {
        this.$message.error('离线机器人不能设置为焦点机器人')
        return
      }
      if (this.activeRobot == robotId) { // 选中自己
        this.activeRobot = ''
        this.toolObj.activeRobot = ''
        localStorage.setItem('toolObj', JSON.stringify(this.toolObj))
        this.mqttElevator(false)
        return
      } else {
        this.activeRobot = robotId
        this.toolObj.activeRobot = this.activeRobot
        localStorage.setItem('toolObj', JSON.stringify(this.toolObj))
        this.mqttElevator(true)
      }

      if (this.mapId == mapId) { //如果点击的焦点机器人在当前楼层中
        return
      }
      this.floorChoose = this.floorList.findIndex(item => {
        return item.mapId === mapId
      })
      this.mapId = mapId
      this.drawArea.clear()
      this.getBottomImg()
      // 当前机器人位置取消
      this.mqtt.subArr.forEach(item => {
        if (item.indexOf('position') > -1) {
          this.mqtt.unsub({ topic: item })
        }
      })
      // 清除数据
      this.drawShape = {
        robot: {},
        line: {}
      }
      this.mqtt.messageArr = []

      // 清空颜色
      this.resetColor()
      const arr = []
      this.robotIdArr.forEach(e => { //筛选选中楼层地图上的机器人
        if (e.mapId === mapId) {
          arr.push(e.robotId)
          this.subRobotPosi(true, e.robotId) // 重新订阅消息
        }
      })
      this.robotIds = arr
    },
    mqttStart() {
      this.mqtt = this.$link({
        host: process.env.VUE_APP_MQTT_HOST,
        port: process.env.VUE_APP_MQTT_PORT,
        userName: 'robot',
        password: 'bdr@147emqx!2020..',
        linkStart: this.linkStart,
        getMessage: this.handleMessage,
        dataLimit: true
      })
      this.mqtt.connect()
    },
    linkStart() {
      console.log('执行连接开始的函数')
      this.mqtt.sub({ topic: '/cloud/web/device/+/status/push' })
      this.robotIdArr.forEach(item => {
        this.subRobotPosi(true, item.robotId)
      })
      // this.test()
      // this.mqtt.sub({ topic: '/cloud/web/device/+/position/push' })
    },
    handleMessage(message) {
      // const obj = {
      //   name: message.destinationName,
      //   qos: message.qos,
      //   value: message.payloadString
      // }
      const name = message.destinationName
      if (typeof (name) == 'string') {
        const isPosi = name.indexOf('position') > -1
        const isStatus = name.indexOf('status') > -1 && name.indexOf('device') > -1
        const isLift = name.indexOf('state') > -1
        // console.log(message.payloadString)
        const data = JSON.parse(message.payloadString)
        // console.log(data)
        if (isPosi) {
          console.log('位置消息')
          this.handlerRobotMessage(data)
        }
        if (isLift) {
          console.log('电梯消息')
          this.handleLift(data)
        }
        if (isStatus) {
          console.log('状态消息')
          console.log(data)
          this.handleDeviceStatus(data)
        }
      }
    },
    subRobotStatus(state, id = '+') { //对接机器人状态mqtt
      if (state) {
        this.mqtt.sub({
          topic: '/cloud/web/device/' + id + '/status/push'
        })
      } else {
        this.mqtt.unsub({
          topic: '/cloud/web/device/' + id + '/status/push'
        })
      }
    },
    subRobotPosi(state, id = '+') { // 对接机器人位置mqtt
      if (state) {
        this.mqtt.sub({
          topic: '/cloud/web/device/' + id + '/position/push'
        })
      } else {
        this.mqtt.unsub({
          topic: '/cloud/web/device/' + id + '/position/push'
        })
      }
    },
    mqttElevator(type, id = '+') {
      type ? this.mqtt.sub({ topic: '/cloud/web/elevator/' + id + '/state/push' }) : this.mqtt.unsub({ topic: '/cloud/web/elevator/' + id + '/state/push' })
    },
    test() {
      const obj = { // 模拟位置数据用
        data: {
          mapId: '333a22c1-a6b6-4e0a-86a6-18e97fa6cd30',
          orientationW: 0.9320093772594417,
          orientationX: 0.0,
          orientationY: 0.0,
          orientationZ: -0.36243416050431515,
          packTimestamp: 0,
          positionX: 105.22200511643638,
          positionY: 171.738617235422,
          positionZ: 0.0
        },
        deviceId: '00000000000000000016',
        sequence: 2020122308071146,
        timestamp: 1608692446433
      }
      const time = setInterval(() => {
        const newObj = {
          data: {
            mapId: '333a22c1-a6b6-4e0a-86a6-18e97fa6cd30',
            orientationW: 0.9320093772594417,
            orientationX: 0.0,
            orientationY: 0.0,
            orientationZ: -0.36243416050431515,
            packTimestamp: 0,
            positionX: obj.data.positionX - 1,
            positionY: obj.data.positionY - 1,
            positionZ: 0.0
          },
          deviceId: '00000000000000000016'
        }
        obj.data.positionX -= 1
        obj.data.positionY -= 1
        this.handlerRobotMessage(newObj)
      }, 2000)
      setTimeout(() => {
        clearInterval(time)
      }, 30000)
    },
    handlerRobotMessage(data) {
      const value = data.data
      // 处理比例尺
      value.positionX = value.positionX / this.resolutionX
      value.positionY = this.mapOrigin.height - (value.positionY / this.resolutionY)
      if (this.drawShape.robot[data.deviceId] &&
      ((this.drawShape.robot[data.deviceId].beforeX - value.positionX > 30) || (this.drawShape.robot[data.deviceId].beforeY - value.positionY > 30))) {
        return
      }
      // console.log('位置', data.deviceId, value.positionX, value.positionY, data.timestamp)
      if (this.activeRobot && value.mapId !== this.mapId) { // mapId变化 刷新地图以及数据
        this.mapId = value.mapId
        this.drawArea.clear()
        this.getBottomImg()
        // 当前机器人位置取消
        this.mqtt.subArr.forEach(item => {
          if (item.indexOf('position') > -1) {
            this.mqtt.unsub({ topic: item })
          }
        })
        // 清除数据
        this.drawShape = {
          robot: {},
          line: {}
        }
        this.mqtt.messageArr = []
        // 清空颜色
        this.resetColor()
        const arr = []
        this.robotIdArr.forEach(e => { //筛选选中楼层地图上的机器人
          if (e.mapId === mapId) {
            arr.push(e.robotId)
            this.subRobotPosi(true, e.robotId) // 重新订阅消息
          }
        })
        this.robotIds = arr
        return
      }
      if (!this.drawShape.robot[data.deviceId]) {
        this.drawShape.robot[data.deviceId] = {}
        this.drawShape.line[data.deviceId] = {}
        this.robotIdArr.forEach(i => {
          if (i.robotId === data.deviceId) {
            this.drawShape.line[data.deviceId].color = i.color
            this.drawShape.robot[data.deviceId].color = i.color
            this.drawShape.robot[data.deviceId].name = i.robotName
          }
        })
        this.drawShape.robot[data.deviceId].arr = []
        this.drawShape.line[data.deviceId].arr = []
      } // 永远以当前现在获取的点作为机器人原点
      if (this.drawShape.robot[data.deviceId].arr.length) {
        const { value } = this.drawShape.robot[data.deviceId].arr[0]
        this.drawShape.line[data.deviceId].arr.push({
            positionX:value.positionX,
            positionY:value.positionY,
        })
        // this.drawShape.line[data.deviceId].arr.push(this.drawShape.robot[data.deviceId].arr[0]) // 原代码
        this.drawShape.robot[data.deviceId].arr = [
          {
            type: 'robot',
            value
          }
        ]
      } else {
        this.drawShape.robot[data.deviceId].arr.push({
          type: 'robot',
          value: data.data
        })
      }
      this.drawShape.robot[data.deviceId].beforeX = value.positionX
      this.drawShape.robot[data.deviceId].beforeY = value.positionY
      if(this.stopRender.scale || this.stopRender.move){
          return
      }
      this.drawRobot()
    },
    handleLift(mes) {
      const data = mes.data
      if (!this.activeRobot || !data.deviceId || this.activeRobot !== data.deviceId) { // 添加呼梯机器人 mark
        this.animate = false
        return
      }
      if (data.elevatorStatus) {
        this.animate = true
        this.active = data.elevatorStatus > 1 ? 'down' : 'up'
      } else {
        this.animate = false
        this.active = ''
      }
      this.floor = data.floor
    },
    // 处理机器人上报的状态信息
    handleDeviceStatus(data) {
      // console.log(this.robotIdArr)
      this.robotIdArr.forEach(e => {
        if (data.deviceId === e.robotId) {
          e.batteryRemain = data.data.batteryRemain
          e.cleanWater = data.data.cleanWater / 1000 === 0 ? '已空' : '正常'
          e.dirtyWater = data.data.dirtyWater / 1000 === 100 ? '已满' : '正常'
          e.taskProcess = data.data.taskProcess / 10
          // e.robotStatus = data.data.robotStatus
          e.isMqttState = true
          // e.status = '在线'
        }
      })
      this.robotIdArr.sort((a, b) => { // 有上报的机器人排前面，没有上报的排后面
        if (!a.batteryRemain && !b.batteryRemain) {
          a.batteryRemain = 0
          b.batteryRemain = 0
        }
        return b.batteryRemain - a.batteryRemain
      })
      // console.log(this.robotIdArr)
    },
    drawRobot() {
      // 画的时候分两块画
      for (const r in this.drawShape.robot) {
        this.drawShape.robot[r].arr.length && this.drawShape.robot[r].arr.forEach((item, index) => {
          const img = this.activeRobot == r ? this.starImg : this.robotImg
          const angle = getDegree(Number(item.value.orientationX), Number(item.value.orientationY), Number(item.value.orientationZ), Number(item.value.orientationW))
          // 默认角度为向下
          // const direction = ((angle - 90 <= 0) && (angle - 90 > -180)) ? 'right' : 'left'
          // const iconW = direction == 'right' ?  : img.width * 0.7 * 0.5
          // const iconH = direction == 'right' ? -img.height * 0.7 * 0.5 : img.height * 0.7 * 0.5
          // console.log(angle - 90)
          const drawIcon = new fabric.Image(img, {
            // backgroundColor: 'red',
            // centeredScaling: true,
            scaleX: 0.6,
            scaleY: 0.6,
            originX: 'center',
            originY: 'center',
            angle: angle - 90,
            // angle: angle + 360 + 270, // 机器人默认多加了90度
            lockScalingX: true,
            lockScalingY: true,
            lockMovementY: true,
            lockMovementX: true,
            lockRotation: true,
            left: this.scalePercent.left + (item.value.positionX * this.scalePercent.x * (1 + this.scalePercent.now)) + (img.width * 0.6 * 0.125),
            top: this.scalePercent.top + (item.value.positionY * this.scalePercent.y * (1 + this.scalePercent.now)) + (img.height * 0.6 * 0.125),
            hoverCursor: 'default',
            selectable: false,
            opacity: this.activeRobot !== r && this.showActiveRobot ? 0 : 1
          })
          const circle = new fabric.Circle({
            radius: 25,
            fill: this.drawShape.robot[r].color,
            stroke: '',
            strokeWidth: 2,
            originX: 'center',
            originY: 'center',
            lockScalingX: true,
            lockScalingY: true,
            lockMovementY: true,
            lockMovementX: true,
            lockRotation: true,
            left: this.scalePercent.left + (item.value.positionX * this.scalePercent.x * (1 + this.scalePercent.now)) + (img.width * 0.6 * 0.125),
            top: this.scalePercent.top + (item.value.positionY * this.scalePercent.y * (1 + this.scalePercent.now)) + (img.height * 0.6 * 0.125),
            hoverCursor: 'default',
            selectable: false,
            opacity: this.activeRobot !== r && this.showActiveRobot ? 0 : 0.45
          })
          drawIcon.on('mousedown', e => {
            if (this.canvasActiveRobot.showMessage) {
              return
            }
            this.canvasActiveRobot.activeLength += 1
            //找到当前激活的机器人
            for (const key in this.drawShape.robot) {
              if (e.target == this.drawShape.robot[key].el) {
                this.canvasActiveRobot.id = key
                this.canvasActiveRobot.name = this.drawShape.robot[key].name
                console.log(e.target)
                this.canvasActiveRobot.top = e.target.top - 50 + 'px'
                this.canvasActiveRobot.left = e.target.left + 'px'
                console.log(this.canvasActiveRobot.top, this.canvasActiveRobot.left, e.target)
              }
            }
            this.canvasActiveRobot.showFun = setTimeout(() => {
              if (this.canvasActiveRobot.activeLength > 1) {
                this.$message({
                  message: '多个机器人重叠暂不能显示机器人信息',
                  type: 'warning'
                })
              } else {
                this.canvasActiveRobot.showMessage = true
                setTimeout(() => {
                  this.canvasActiveRobot.showMessage = false
                  this.canvasActiveRobot.activeLength = 0
                }, 1500)
              }
            }, 200)
          })
          this.drawShape.robot[r].el && this.drawArea.remove(this.drawShape.robot[r].el)
          this.drawShape.robot[r].circle && this.drawArea.remove(this.drawShape.robot[r].circle)
          this.drawShape.robot[r].el = drawIcon
          this.drawShape.robot[r].circle = circle
          this.drawArea.add(circle)
          this.drawArea.add(drawIcon)
          this.drawArea.moveTo(circle, 1)
          this.drawArea.moveTo(drawIcon, 3)
        })
      }

      for (const key in this.drawShape.line) { // 画路径
        let start; let middle; const end = ' o'
        // console.log(this.drawShape.line[key].arr)
        if (this.drawShape.line[key].arr.length > 1) {
          this.drawShape.line[key].arr.forEach((item, index) => {
            if (index === 0) {
              start = ' M ' +
                  ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                  ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
            } else {
              middle = middle
                ? middle + ' L ' +
                    ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                    ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
                : ' L ' +
                    ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                    ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
            }
          })
          const path = start + middle + end
          // console.log(path)
          // const color = this.drawShape.line[key].el ? this.drawShape.line[key].color : this.getColor()
          this.drawShape.line[key].el && this.drawArea.remove(this.drawShape.line[key].el)
          const drawPath = new fabric.Path(path, {
            stroke: this.drawShape.line[key].color, // 需要使用动态颜色进行匹配
            fill: 'transparent',
            strokeWidth: 2,
            hoverCursor: 'default',
            selectable: false,
            opacity: this.showLine ? (this.showActiveRobot && this.activeRobot !== key ? 0 : 1) : 0
          })
          this.drawShape.line[key].el = drawPath
          // this.drawShape.line[key].percent = this.scalePercent.now + 1
          // this.drawShape.line[key].createOriginX = this.scalePercent.left
          // this.drawShape.line[key].createOriginY = this.scalePercent.top
          this.drawArea.add(drawPath)
          this.drawArea.moveTo(drawPath, 2)
        }
      }
    },
    drawMap(obj = {}) {
      if (!this.mapOrigin.width || !this.mapOrigin.height) {
        console.log('暂未获取到原图尺寸')
        return
      }
      this.drawArea.setBackgroundImage(this.bottomMap, this.drawArea.renderAll.bind(this.drawArea), {
        // opacity: 1,
        // angle: 0,
        // left: -4500,
        // top: -300,
        // obj.left !== '' ? obj.left :
        // obj.top !== '' ? obj.top :
        left: this.scalePercent.left,
        top: this.scalePercent.top,
        scaleX: obj.x || (this.drawArea.width / this.mapOrigin.width),
        scaleY: obj.y || (this.drawArea.height / this.mapOrigin.height)
        // originY: 'top'
        // originX: 'left',
      })
    },
    mouseUp(e) {
      this.pressing = false
      this.pressOrigin.x = ''
      this.pressOrigin.y = ''
    },
    mouseDown(e) {
      if (this.showToolBox) {
        this.showToolBox = false
      }
      // console.log(e)
      this.pressing = true
      // this.selectChild = false
      const { x, y } = e.pointer
      this.pressOrigin.x = x // this.mouseFrom.x
      this.pressOrigin.y = y // this.mouseFrom.y
      if (this.drawType) { // 执行对应drawType的任务
        this.drawOther(e)
      }
    },
    mouseMove(move) {
      if (!this.pressing) { // 如果不是按着拖动，不移动背景图
        return
      }
      const canvasWidth = Number(this.canvasW.split('px')[0])
      const canvasHeight = Number(this.canvasH.split('px')[0])
      const moveX = move.pointer.x - this.pressOrigin.x // this.mouseTo.x = move.pointer.x
      const moveY = move.pointer.y - this.pressOrigin.y // this.mouseTo.y = move.pointer.y
      // 边界处理
      if (this.scalePercent.left + moveX > 0) {
        return
      }
      // * (1 + this.scalePercent.now)
      if (Math.abs(this.scalePercent.left + moveX) > ((Math.abs(this.scalePercent.x) * (1 + this.scalePercent.now) * this.mapOrigin.width) - canvasWidth)) {
        return
      }
      if (this.scalePercent.top + moveY > 0) {
        return
      }
      // * (1 + this.scalePercent.now)
      if (Math.abs(this.scalePercent.top + moveY) > ((Math.abs(this.scalePercent.y) * (1 + this.scalePercent.now) * this.mapOrigin.height) - canvasHeight)) {
        return
      }
      this.scalePercent.before = this.scalePercent.now // 移动后的比例尺
      this.scalePercent.left += moveX
      this.scalePercent.top += moveY
      // console.log('拖动后的位置',-this.scalePercent.left,-this.scalePercent.top)

      this.handleMove(moveX, moveY, this)
      this.pressOrigin.x = move.pointer.x
      this.pressOrigin.y = move.pointer.y
    },
    handleMove: throttle((moveX, moveY, _this) => {
      _this.stopRender.move = true
      _this.handleModuleChange('move', { moveX, moveY })
      _this.handleHistory()
      _this.drawMap({
        // left: this.scalePercent.left * (1 + this.scalePercent.now),
        // top: this.scalePercent.top * (1 + this.scalePercent.now),

        x: _this.scalePercent.x * (1 + _this.scalePercent.now),
        y: _this.scalePercent.y * (1 + _this.scalePercent.now),
        move: { moveX, moveY }
      })
      _this.stopRender.move = false
    }, 40),
    scale(num) {
      if (num > 0) { // 放大
        if (this.scalePercent.x * (1 + this.scalePercent.now) > 1) {
          this.$message({
            type: 'warnging',
            message: '不能再放大了'
          })
        }
        this.scalePercent.now += 1
      } else { // 缩小
        if (this.scalePercent.now - 1 < 0) {
          this.$message({
            type: 'warnging',
            message: '不能再缩小了'
          })
          return
        }
        this.scalePercent.now -= 1
        const canvasWidth = Number(this.canvasW.split('px')[0])
        const canvasHeight = Number(this.canvasH.split('px')[0])
      }
      if (this.scalePercent.left || this.scalePercent.top) { // 如果有移动过则要按移动重新操作位置
        this.scalePercent.left = (this.scalePercent.left * this.scalePercent.now) / this.scalePercent.before
        this.scalePercent.top = (this.scalePercent.top * this.scalePercent.now) / this.scalePercent.before
        this.scalePercent.before = this.scalePercent.now
      }
      if (this.scalePercent.now === 0) { // 还原此时原点
        this.scalePercent.left = 0
        this.scalePercent.top = 0
      }

      this.handleScale(this)
    },
    handleScale: throttle(_this => {
      _this.stopRender.scale = true
      _this.handleModuleChange('scale')
      _this.handleHistory()
      _this.drawMap({
        // left: this.scalePercent.left,
        // top: this.scalePercent.top,

        x: _this.scalePercent.x * (1 + _this.scalePercent.now), // 换算百分比
        y: _this.scalePercent.y * (1 + _this.scalePercent.now) // 换算百分比
      })
      _this.stopRender.scale = false
    }, 50),
    handleModuleChange(type) { // icon只有坐标变化 特殊原点以及宽高也需要变化
      if (type === 'scale') {
        for (const key in this.drawShape.robot) {
          this.drawShape.robot[key].arr.forEach(item => {
            const angle = getDegree(Number(item.value.orientationX), Number(item.value.orientationY), Number(item.value.orientationZ), Number(item.value.orientationW))
            const scaleX = (this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left
            const scaleY = (this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top
            const img = this.activeRobot == key ? this.starImg : this.robotImg
            const imgInstance = new fabric.Image(img, {
              left: scaleX + (img.width * 0.6 * 0.125),
              top: scaleY + (img.height * 0.6 * 0.125),
              scaleX: 0.6,
              scaleY: 0.6,
              originX: 'center',
              originY: 'center',
              angle: angle - 90, // fabric 只接受正数坐标
              lockScalingX: true,
              lockScalingY: true,
              lockMovementY: true,
              lockMovementX: true,
              lockRotation: true,
              hoverCursor: 'default',
              selectable: false,
              opacity: this.activeRobot !== key && this.showActiveRobot ? 0 : 1
            })

            const circle = new fabric.Circle({
              radius: 25,
              fill: this.drawShape.robot[key].color,
              stroke: '',
              strokeWidth: 2,
              originX: 'center',
              originY: 'center',
              lockScalingX: true,
              lockScalingY: true,
              lockMovementY: true,
              lockMovementX: true,
              lockRotation: true,
              left: this.scalePercent.left + (item.value.positionX * this.scalePercent.x * (1 + this.scalePercent.now)) + (img.width * 0.6 * 0.125),
              top: this.scalePercent.top + (item.value.positionY * this.scalePercent.y * (1 + this.scalePercent.now)) + (img.height * 0.6 * 0.125),
              hoverCursor: 'default',
              selectable: false,
              opacity: this.activeRobot !== key && this.showActiveRobot ? 0 : 0.45
            })
            imgInstance.on('mousedown', e => {
              if (this.canvasActiveRobot.showMessage) {
                return
              }
              this.canvasActiveRobot.activeLength += 1
              //找到当前激活的机器人
              for (const key in this.drawShape.robot) {
                if (e.target == this.drawShape.robot[key].el) {
                  this.canvasActiveRobot.id = key
                  this.canvasActiveRobot.name = this.drawShape.robot[key].name
                }
              }
              this.canvasActiveRobot.showFun = setTimeout(() => {
                if (this.canvasActiveRobot.activeLength > 1) {
                  this.$message({
                    message: '多个机器人重叠暂不能显示机器人信息',
                    type: 'warning'
                  })
                } else {
                  this.canvasActiveRobot.showMessage = true
                  setTimeout(() => {
                    this.canvasActiveRobot.showMessage = false
                    this.canvasActiveRobot.activeLength = 0
                  }, 1500)
                }
              }, 200)
            })
            this.drawShape.robot[key].el && this.drawArea.remove(this.drawShape.robot[key].el)
            this.drawShape.robot[key].circle && this.drawArea.remove(this.drawShape.robot[key].circle)
            this.drawArea.add(imgInstance)
            this.drawArea.add(circle)
            this.drawShape.robot[key].percent = this.scalePercent.now + 1
            this.drawShape.robot[key].el = imgInstance
            this.drawShape.robot[key].circle = circle
            this.drawArea.moveTo(circle, 1)
            this.drawArea.moveTo(imgInstance, 3)
          })
        }
        for (const l in this.drawShape.line) {
          if (this.drawShape.line[l].arr.length > 1) {
            let start; let middle; const end = ' o'
            this.drawShape.line[l].arr.forEach((item, index) => {
              // const x = Math.abs(item.createOriginX) // 得出当时原点的偏移量
              // const y = Math.abs(item.createOriginY)
              // console.log('绘制前:', i[1], i[2], this.scalePercent.now, item.percent)
              // console.log('绘制后:', (i[1] * (this.scalePercent.now + 1)) / item.percent, (i[2] * (this.scalePercent.now + 1)) / item.percent + 1)
              if (index === 0) {
                start = ' M ' +
                    ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                    ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
              } else {
                middle = middle
                  ? middle + ' L ' +
                      ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                      ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
                  : ' L ' +
                      ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                      ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
              }
            })
            // this.drawShape.robot[l].percent = this.scalePercent.now + 1
            // item.createOriginX = this.scalePercent.left
            // item.createOriginY = this.scalePercent.top
            const path = start + middle + end
            // console.log(path)
            const newPath = new fabric.Path(path, {
              stroke: this.drawShape.line[l].color,
              fill: 'transparent',
              strokeWidth: 2,
              lockScalingX: true,
              lockScalingY: true,
              lockMovementY: true,
              lockMovementX: true,
              lockRotation: true,
              hoverCursor: 'default',
              selectable: false,
              opacity: this.showLine ? (this.showActiveRobot && this.activeRobot !== l ? 0 : 1) : 0
            })
            this.drawArea.remove(this.drawShape.line[l].el)
            this.drawArea.add(newPath)
            this.drawShape.line[l].el = newPath
            this.drawArea.moveTo(newPath, 2)
          }
        }
      }
      if (type === 'move') {
        // const { moveX, moveY } = before
        for (const key in this.drawShape.robot) {
          this.drawShape.robot[key].arr.forEach(item => {
            const angle = getDegree(Number(item.value.orientationX), Number(item.value.orientationY), Number(item.value.orientationZ), Number(item.value.orientationW))
            const beforeX = (this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left
            const beforeY = (this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top
            const img = this.activeRobot == key ? this.starImg : this.robotImg
            const imgInstance = new fabric.Image(img, {
              left: beforeX + +(img.width * 0.6 * 0.125),
              top: beforeY + +(img.height * 0.6 * 0.125),
              originX: 'center',
              originY: 'center',
              scaleX: 0.6,
              scaleY: 0.6,
              angle: angle + 360 + 270, // fabric 只接受正数坐标
              lockScalingX: true,
              lockScalingY: true,
              lockMovementY: true,
              lockMovementX: true,
              lockRotation: true,
              hoverCursor: 'default',
              selectable: false,
              opacity: this.activeRobot !== key && this.showActiveRobot ? 0 : 1
            })

            const circle = new fabric.Circle({
              radius: 25,
              fill: this.drawShape.robot[key].color,
              stroke: '',
              strokeWidth: 2,
              originX: 'center',
              originY: 'center',
              lockScalingX: true,
              lockScalingY: true,
              lockMovementY: true,
              lockMovementX: true,
              lockRotation: true,
              left: this.scalePercent.left + (item.value.positionX * this.scalePercent.x * (1 + this.scalePercent.now)) + (img.width * 0.6 * 0.125),
              top: this.scalePercent.top + (item.value.positionY * this.scalePercent.y * (1 + this.scalePercent.now)) + (img.height * 0.6 * 0.125),
              hoverCursor: 'default',
              selectable: false,
              opacity: this.activeRobot !== key && this.showActiveRobot ? 0 : 0.45
            })
            imgInstance.on('mousedown', e => {
              if (this.canvasActiveRobot.showMessage) {
                return
              }
              this.canvasActiveRobot.activeLength += 1
              //找到当前激活的机器人
              for (const key in this.drawShape.robot) {
                if (e.target == this.drawShape.robot[key].el) {
                  this.canvasActiveRobot.id = key
                  this.canvasActiveRobot.name = this.drawShape.robot[key].name
                }
              }
              this.canvasActiveRobot.showFun = setTimeout(() => {
                if (this.canvasActiveRobot.activeLength > 1) {
                  this.$message({
                    message: '多个机器人重叠暂不能显示机器人信息',
                    type: 'warning'
                  })
                } else {
                  this.canvasActiveRobot.showMessage = true
                  setTimeout(() => {
                    this.canvasActiveRobot.showMessage = false
                    this.canvasActiveRobot.activeLength = 0
                  }, 1500)
                }
              }, 200)
            })
            this.drawShape.robot[key].el && this.drawArea.remove(this.drawShape.robot[key].el)
            this.drawShape.robot[key].circle && this.drawArea.remove(this.drawShape.robot[key].circle)
            this.drawArea.add(circle)
            this.drawArea.add(imgInstance)
            this.drawArea.moveTo(circle, 1)
            this.drawArea.moveTo(imgInstance, 3)
            this.drawShape.robot[key].circle = circle
            this.drawShape.robot[key].el = imgInstance
          })
        }

        for (const l in this.drawShape.line) {
          if (this.drawShape.line[l].arr.length > 1) {
            let start; let middle; const end = ' o'
            this.drawShape.line[l].arr.forEach((item, index) => {
            // const x = Math.abs(item.createOriginX) // 得出当时原点的偏移量
            // const y = Math.abs(item.createOriginY)
            // console.log('移动前的数据', i[1], i[2], '偏移量')
              if (index === 0) {
                start = ' M ' +
                  ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                  ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
              } else {
                middle = middle
                  ? middle + ' L ' +
                    ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                    ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
                  : ' L ' +
                    ((this.scalePercent.x * item.value.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                    ((this.scalePercent.y * item.value.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
              }
              // item.createOriginX = this.scalePercent.left
              // item.createOriginY = this.scalePercent.top
              const path = start + middle + end
              // console.log(path)
              const newPath = new fabric.Path(path, {
                stroke: this.drawShape.line[l].color,
                fill: 'transparent',
                strokeWidth: 2,
                lockScalingX: true,
                lockScalingY: true,
                lockMovementY: true,
                lockMovementX: true,
                lockRotation: true,
                hoverCursor: 'default',
                selectable: false,
                opacity: this.showLine ? (this.showActiveRobot && this.activeRobot !== l ? 0 : 1) : 0
              })
              this.drawArea.remove(this.drawShape.line[l].el)
              this.drawArea.add(newPath)
              this.drawShape.line[l].el = newPath
              this.drawArea.moveTo(newPath, 2)
            })
          }
        }
      }
    },
    // 获取组织列表（楼层）
    getFloor() {
      getfloorMap('16044558013643816').then(res => {
        console.log(res)
        if (res.resultCode === 0) {
          if (!res.data || !res.data.length) {
            this.$message({
              message: '没有获取到楼层',
              type: 'error'
            })
            return
          }
          const arr = []
          res.data.forEach(e => {
            const obj = {}
            obj.floor = e.floor + '层'
            obj.floorId = e.floorId
            obj.mapId = e.maps.length > 0 ? e.maps[0].mapId : ''
            arr.push(obj)
          })
          this.floorList = arr
        }
      })
    },
    // 获取楼栋的机器人列表
    async getrobotList () {
      const res = await mapAndRobot(JSON.stringify({ organizationId: '16044558013591350' }))
      if (res.resultCode === 0) {
        if (!res.data.robotIdMapIds || !res.data.robotIdMapIds.length) {
          this.$message({
            message: '没有获取到机器人列表',
            type: 'error'
          })
          return
        }
        this.robotIdArr = res.data.robotIdMapIds
        console.log(this.robotIdArr)
        // 默认显示有地图有机器人的楼层
        this.floorList.forEach((e, idx) => {
          this.robotIdArr.forEach(ele => {
            if (e.mapId === ele.mapId) {
              // mark 获取历史路径
              this.floorChoose = idx
              this.mapId = e.mapId
            }
          })
        })
        //筛选选中楼层地图上的机器人
        const arr = []
        const promiseArr = []
        this.robotIdArr.forEach(e => {
          e.color = this.getColor()
          if (e.mapId === this.mapId) {
            arr.push(e.robotId)
          }
          if (e.robotStatus) {
            promiseArr.push((async e => {
              await this.getHistoryLine(e)
            })(e))
          }
        })
        await Promise.all(promiseArr).then(res => {
          console.log('已获取所有在线机器人路径')
        })
        this.robotIds = arr
        console.log(this.mapId, this.robotIds)
      }
    },
    // 获取地图分辨率
    getresolution (x, y) {
      getMessage(this.mapId).then(res => {
        console.log(res)
        if (res.resultCode === 0 && res.data) {
          if (res.data.attribute.resolutionX !== 0) {
            this.resolutionX = res.data.attribute.resolutionX
          }

          if (res.data.attribute.resolutionY !== 0) {
            this.resolutionY = res.data.attribute.resolutionY
          }
          console.log(res.data.attribute.resolutionX, res.data.attribute.resolutionY)
        }
      })
    },
    // 获取地图底图
    async getBottomImg() {
      await bottomImg(this.mapId).then(img => {
        console.log(img)
        const base64 = img.data && 'data:image/jpeg;base64,' + img.data
        const map = new Image()
        map.src = base64
        this.bottomMap = base64
        // console.log(this.bottomMap)
        map.onload = () => {
          this.mapOrigin.width = map.width
          this.mapOrigin.height = map.height
          this.scalePercent.x = this.drawArea.width / this.mapOrigin.width
          this.scalePercent.y = this.drawArea.height / this.mapOrigin.height
          this.drawMap({
            left: 0,
            top: 0
          })
          this.handleHistory()
        }
      }).catch(err => {
        console.log(err)
        this.$message.error('地图文件不存在')
      })
    },
    async getHistoryLine(e) {
      const { robotId, mapId } = e
      // console.log(robotId, mapId)
      const params = JSON.stringify({ parameter: { deviceId: robotId, mapId } })
      const data = await this.$https.post('/device/historyPositions', params)
      if (data && data.data && data.data.length > 1) {
        this.historyLine[robotId] = {}
        data.data.forEach(item => {
          if (!this.historyLine[robotId][item.pathLabel]) {
            this.historyLine[robotId][item.pathLabel] = []
            this.historyLine[robotId][item.pathLabel + 'el'] = {}
          }
          this.historyLine[robotId][item.pathLabel].push({
            positionX: item.positionX / this.resolutionX,
            positionY: item.positionY / this.resolutionY
          })
        })
      }
    },
    handleHistory() {
      for (const key in this.historyLine) { // 不同的机器人路径
        for (const l in this.historyLine[key]) { // 机器人不同时间段路径
          let start; let middle; const end = ' o'; let color
          if (this.historyLine[key][l].length && this.historyLine[key][l].length > 1) {
            this.historyLine[key][l].forEach((item, index) => {
              if (index == 0) {
                start = ' M ' + ((this.scalePercent.x * item.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                        ((this.scalePercent.y * item.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
              } else {
                middle = middle
                  ? middle + ' L ' +
                    ((this.scalePercent.x * item.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                    ((this.scalePercent.y * item.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
                  : ' L ' +
                    ((this.scalePercent.x * item.positionX * (this.scalePercent.now + 1)) + this.scalePercent.left) + ' ' +
                    ((this.scalePercent.y * item.positionY * (this.scalePercent.now + 1)) + this.scalePercent.top)
              }
            })
            const path = start + middle + end
            if (this.drawShape.robot[key]) {
              color = this.drawShape.robot[key].color
            } else {
              this.robotIdArr.forEach(item => {
                if (item.robotId == key) {
                  color = item.color
                }
              })
            }
            // console.log(this.drawShape.robot[key], 464664674647354)
            const newPath = new fabric.Path(path, {
              stroke: color,
              angle: -90,
              fill: 'transparent',
              strokeWidth: 2,
              lockScalingX: true,
              lockScalingY: true,
              lockMovementY: true,
              lockMovementX: true,
              lockRotation: true,
              originX: 'center',
              originY: 'center',
              hoverCursor: 'default',
              selectable: false
            })
            this.historyLine[key][l + 'el'] && this.drawArea.remove(this.historyLine[key][l + 'el'])
            this.drawArea.add(newPath)
            this.historyLine[key][l + 'el'] = newPath
          }
        }
      }
    }

  }
}
</script>

<style lang="less" scoped>
/* @import url(); 引入css类 */
@color:#4157ff;
.active{
  color: @color;
}
.par-box{
  width: 100%;
}

  .demo-top{
    margin: 10px 0 10px 20px;
		position: relative;
		h6 {
			display: inline-block;
			vertical-align: top;
			margin-left: 5px;
			font-size: 14px;
			color: #666666;
		}
  }
  .robot-container{
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    .floor-in-build {
			width: 90px;
			height: 600px;
			border: 1px solid #ccc;
      font-size: 14px;
      margin-left: 20px;
      .floor-box{
        height: 560px;
        overflow: auto;
        overflow-x: auto;
      }
			dt {
				width: 100%;
				height: 35px;
        line-height: 35px;
        text-align: center;
				background: #ececec;
			}
			div {
        width: 88px;
        padding: 0 15px 0 5px;
        box-sizing: border-box;
				dd {
          height: 45px;
					color: #999999;
					border-bottom: 1px solid #ccc;
          cursor: pointer;
          line-height: 55px;
          display: flex;
          justify-content: space-between;
          flex-wrap: nowrap;
          span{
            padding-left: 10px;
          }
					i {
            font-size: 14px;
            margin-right: -12px;
            margin-top: 20px;
            color: @color;
					}
				}
				dd:last-of-type {
					border-bottom: none;
				}
			}
    }
    .map-cantain{
      // width: 100%;
      border: 1px solid #ccc;
      position: relative;
      .lift-box{
        background-color: #fff;
        width: 120px;
        position: absolute;
        right: 1px;
        top: -1px;
        .lift{
          width: 120px;
          border: 1px solid #939393;
          .lift-head{
            box-sizing: border-box;
            padding:0 30px 0 30px;
            border-bottom: 1px solid #939393;
            height: 40px;
            display: flex;
            justify-content: space-around;
            overflow: hidden;
            p{
              align-self: center;
              font-size: 14px;
              font-weight: 550;
            }
          }
          .lift-foot{
            position: relative;
            height: 105px;
            display: flex;
            justify-content: center;
            p{
              width: 1px;
              height: 100%;
              background-color: #939393;
            }
            div{
              position: absolute;
              z-index: 2;
              // display:block;
              align-self: center;
            }
          }
        }
      }
      .map-icon-desc{
        width: 130px;
        height: 300px;
        padding: 15px 0 0 15px;
        box-sizing: border-box;
        background: rgba(0,0,0,0.6);
        position: absolute;
        bottom: 0;
        right: 0;
        dl {
					color: #eee;
					dt {
						h6 {
							font-size: 12px;
							height: 30px;
						}
					}
					dd {
						height: 22px;
						img {
							display: inline-block;
							width: 18px;
							height: 18px;
							vertical-align: top;
							margin-right: 4px;
						}
					}
					.station,
					.elevation,
					.map-out {
						height: 40px;
					}
				}
      }
      .magnifier{
        position: absolute;
        left: 20px;
        top: 15px;
        .scale-icon{
          padding: 5px;
          background: #FFFFFF;
          box-shadow: 1px 1px 3px 0 rgba(0,0,0,0.18);
        }
        .tool-icon{
          display: inline-block;
          vertical-align: top;
          padding: 5px;
          background: #FFFFFF;
          box-shadow: 1px 1px 3px 0 rgba(0,0,0,0.18);
          height: 24px;
          color: #666;
          position: relative;
          span{
            display: inline-block;
            vertical-align: top;
            margin: 2px 4px;
            cursor: pointer;
          }
          i{
            display: inline-block;
            vertical-align: top;
            margin-top: 5px;
          }

          .choose-drop{
            padding: 5px;
            width: 180px;
            height: 115px;
            position: absolute;

            top: 35px;
            left: 0;
            background: #FFFFFF;
            box-shadow: 1px 1px 3px 0 rgba(0,0,0,0.18);
            li{
              height: 35px;
              line-height: 35px;
              padding-left: 25px;
              border-bottom: 1px solid #eee;
              position: relative;
              cursor: pointer;
              &:last-of-type{
                border-bottom: none;
              }
              i{
                position: absolute;
                font-size: 14px;
                top: 4px;
                left: 5px;
                font-weight: 600;
              }
            }
          }
        }
      }
      .robot-message{
        position: absolute;
        width: 210px;
        height: 60px;
        background: #000;
        opacity: 0.7;
        padding: 15px;
        box-sizing: border-box;
        border-radius: 8px;
        color: #eee;
      }
    }
    .robot-group{
      margin-right: 12px;
      width: 280px;
      .robot-roup-ul{
        margin-left: 12px;

        height: 760px;
        overflow: auto;
        // .li-active-robot{
        //   border-color:@color !important;
        //   .left-img{
        //     border-color:@color !important;
        //   }
        //   .robot-status-text{
        //     color:@color !important;
        //   }
        // }
        .robot-roup-li{
          width: 258px;
          height: 100px;
          border: 1px solid #ccc;
          display: flex;
          justify-content: space-between;
          padding: 10px;
          margin-bottom: 10px;
          color: #666;
          cursor: pointer;
          .left{
            text-align: center;
            .left-img{
              width: 40px;
              height: 40px;
              border-width: 3px;
              border-style: solid;
              border-radius: 50%;
              margin-bottom: 5px;
              img{
                width: 24px;
                height: 24px;
                margin: 8px;
              }
            }

          }

          .right{
            width: 180px;

            // color: #666;
            .robot-name{
              font-size: 14px;
              display: flex;
              justify-content: space-between;
            }
            .robot-id{
              font-size: 10px;
              transform: scale(0.8);
              margin-left: -20px;
            }
            .work-progress{
              margin-top: -2px;
              /deep/.el-progress__text {
                transform: scale(0.7) !important;
              }
              /deep/.el-progress-bar__outer, /deep/.el-progress-bar__inner{


                border-radius: 2px !important;
              }
              // /deep/.el-progress-bar__inner{
              //   background-color: @color;
              // }
            }
            .robot-status{
              display: flex;
              margin-top: 3px;
              li{
                width: 30px;
                position: relative;
                margin-right: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                .battery-gress{
                  width: 20px;
                  margin-top: 4px;
                  /deep/.el-progress-bar__outer{
                    width: 18px;
                    border-radius: 0;
                    border: 1px solid #979797;
                  }
                  /deep/.el-progress-bar__inner{
                    max-width: 16px;
                    border-radius: 0;
                    height: 4px;
                    margin-top: 1px;
                    margin-left: 1px;
                    background-color: #979797;
                  }
                }
                .battery-text{
                  margin-top: 4px;
                }
                i{
                  position: absolute;
                  width: 1px;
                  height: 4px;
                  background:  #979797;
                  top: 6px;
                  left: 25px;
                }
                img{
                  width: 14px;
                  height: 16px;
                }
                span{
                  font-size: 12px;
                  transform: scale(0.8);
                }
              }
            }
          }
        }
        .robot-model{
          background: #fafafa;
          color: #999999 !important;
        }
      }

    }
  }


.up{
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 16px solid #FABD00;
}

.move-up{
  animation:toup 1300ms infinite;
  transition:all 1300ms linear;
}

.down{
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 16px solid #FABD00;
}

.move-down{
  animation:todown 1300ms infinite;
  transition:all 1300ms linear;
}

@keyframes toup
	{
	from {
    transform: translateY(30px);
  }
  to {
    transform: translateY(-30px);
  }
}

@keyframes todown
  {
  from {
    transform: translateY(-30px);
  }
  to {
    transform: translateY(30px);
  }
}

</style>
