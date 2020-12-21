<template>
  <el-container>
    <el-header>
      <ul class="sign-head">
        <li class="mapName" style="font-weight: bold;font-size: 20px;color: #333;">{{this.mapName}}</li>
        <span>
          <li class="revoke" @click="back()">撤销(Ctrl+Z)</li>
          <li class="repeat" @click="test2">重做</li>
          <li class="brg done" @click="test">确定</li>
          <li class="brg resore" @click="save">保存</li>
        </span>
      </ul>
    </el-header>

    <el-container>
      <el-aside>
        <ul class="sign-aside">
          <el-scrollbar style="height: 100%;">
            <li v-for="stem in drawSpec" class="li-list" :key="stem.key">
              <p :class="[stem.className,specActive==stem.key ? 'listActive' : '']" @click="readyToDraw(stem)">
                <span>{{stem.text}}</span>
              </p>
            </li>
            <hr class="hr" />
            <li v-for="item in drawModule" :key="item.key" class="li-list">
              <!-- listActive 激活的class -->
              <p :class="[item.className,activeModule===item.key ? 'listActive' : '']" @click.stop="clickModule(item.key)">
                <span >{{item.text}}</span>
                <!-- :class="[activeModule===item.key ? 'active listActive' : '']" -->
                <i></i>
                <ul v-if="item.child && item.child.length" class="child">
                    <li v-for="xtem in item.child" :key="xtem.key" v-show="showChild===item.key" @click.stop="clickChild(xtem.key)">
                      <p :class="[xtem.className, activeChild===xtem.key ? 'listActive' : '']" >
                        <span >{{xtem.text}}</span>
                        <!-- :class="[ activeChild===xtem.key ? 'active listActive' : '' ]" -->
                      </p>
                    </li>
                </ul>
              </p>
            </li>
          </el-scrollbar>
        </ul>
      </el-aside>

      <el-main class="map">
          <canvas id="canvas" :width="canvasW" :height="canvasH"></canvas>
      </el-main>

      <el-aside class="sign" v-show="false">
        <el-scrollbar style="height: 100%;">
          <h3 class="sign-title">图层 <img src="../../../assets/images/map/no-see.png" alt="" class="showAllBtn iconBtn hidden"></h3>
          <dl v-for="(item,k) in drawList" :key="k" >
            <dt class="sign-dt">
              <i class="triangle el-icon-caret-bottom"></i>{{item.text}}<img src="../../../assets/images/map/no-see.png" class="showBtn iconBtn hidden" >
            </dt>
          </dl>
        </el-scrollbar>
      </el-aside>

      <div class="magnifier">
        <img src="../../../assets/images/map/moveicon.png" class="move">
        <img src="../../../assets/images/map/bigicon.png" class="bigger scaleNum" @click.stop="scale(1)">
        <img src="../../../assets/images/map/smallicon.png" class="smaller scaleNum" @click.stop="scale(-1)">
      </div>

    </el-container>

    <!-- 填写坐标方向的对话框 -->
    <el-dialog :title="title" width="480px" :visible.sync="dialogVisible" :close-on-click-modal="false" :append-to-body='true' @close="dialogClose">
      <div class="dialog-container">
        <el-form :model="form" :rules="rules" ref="dialogForm">
          <h6>方向轴</h6>
          <el-form-item label="X轴" label-width="60px" prop="x">
            <el-input v-model="form.x" placeholder="请填写X轴" type="number"></el-input>
          </el-form-item>
          <el-form-item label="Y轴" label-width="60px" prop="y">
            <el-input v-model="form.y" placeholder="请填写Y轴" type="number"></el-input>
          </el-form-item>
          <el-form-item label="Z轴" label-width="60px" >
            <el-input v-model="form.z" placeholder="请填写Z轴" disabled></el-input>
          </el-form-item>
          <h6>角度</h6>
          <el-form-item label="X" label-width="60px">
            <el-input v-model="form.orientationX" placeholder="请填写X值" disabled></el-input>
          </el-form-item>
          <el-form-item label="Y" label-width="60px">
            <el-input v-model="form.orientationY" placeholder="请填写Y值" disabled></el-input>
          </el-form-item>
          <el-form-item label="Z" label-width="60px" prop="orientationZ">
            <el-input v-model="form.orientationZ" placeholder="请填写Z值" type="number"></el-input>
          </el-form-item>
          <el-form-item label="W" label-width="60px" prop="orientationW">
            <el-input v-model="form.orientationW" placeholder="请填写W值" type="number"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="medium" style="width:320px" @click="createDrawIcon" type="primary">确 定</el-button>
        </span>
      </div>

    </el-dialog>


    <!-- 点击显示相关兴趣点的方向和角度 -->
   <!-- <div class="interestPoint">
      <h6>
        <img src="../../../assets/images/index/station1.png" alt="">
        <span>工作站</span>
        <b style="color: #F453BD">S1</b>
      </h6>
      <div class="point-data">
        <div class="model-left">
          <p>方向轴</p>
          <p><span>X轴</span><b>1111.111</b></p>
          <p><span>Y轴</span><b>1111.111</b></p>
          <p><span>Z轴</span><b>0</b></p>
        </div>
        <div class="model-right">
          <p>角度</p>
          <p><span>X</span><b>0</b></p>
          <p><span>Y</span><b>0</b></p>
          <p><span>Z</span><b>12.123</b></p>
          <p><span>W</span><b>12.123</b></p>
        </div>
      </div>
    </div> -->
  </el-container>
</template>

<script>
import { bottomImg, getMessage, sendMessage } from '@/api/clean-robot/map.js'
import { fabric } from 'fabric'
import { toEulerAngle, getDegree } from '../../../util/point.js'
import { v4 as uuidv4 } from 'uuid'
// import MapEdit from '@/views/clean-robot/map-manage/signMap.js'
// import { httpUrl } from '@/config.js'
// import { format } from '@/util/changeTime.js'

export default {
  props: ['mapId', 'mapName'],
  name: '',
  data() {
    return {
      testMqtt: '',

      showDefault: true, // 左边操作选项集合相关
      showDefaultMap: true,
      showDefaultElevator: true,
      showDefaultWall: true,
      choseItem: 0,
      choseMapItem: 0,
      choseElevatorItem: 0,
      choseWallItem: 0,
      showStationGroup: false,
      showMapGroup: false,
      showElevatorGroup: false,
      showWallGroup: false,
      title: 'S 工作站',
      dialogVisible: false, // 展示输入坐标框
      form: { // 填写角度坐标表单
        x: '',
        y: '',
        z: 0,
        orientationX: 0,
        orientationY: 0,
        orientationZ: '',
        orientationW: ''
      },
      rules: {
        x: [{ required: true, message: '请输入x轴坐标', trigger: 'change' }],
        y: [{ required: true, message: '请输入y轴坐标', trigger: 'change' }],
        orientationZ: [{ required: true, message: '请输入角度Z', trigger: 'change' }],
        orientationW: [{ required: true, message: '请输入角度W', trigger: 'change' }]
      },

      // 原demo用的部分变量
      // rect: [], 暂未用上
      // showMenu: false, 暂未用上
      // x: '',  暂未用上
      // y: '',  暂未用上
      // mouseFrom: {}, 已经有变量替换大部分
      mouseTo: {},
      // textbox: null, 暂时用不上
      // rectangleLabel: 'warning', 暂未用上
      drawWidth: 2, // 笔触宽度
      color: '#E34F51', // 画笔颜色
      drawingObject: null, // 当前绘制对象
      // moveCount: 1, //绘制移动计数器
      doDrawing: false, // 绘制状态
      // polygon 相关参数
      polygonMode: false,
      pointArray: [], // 多边形的点 数组
      lineArray: [], // 多边形的线 数组
      activeShape: false,
      activeLine: '',
      line: {}, // 画墙用的线 数组
      // delectKlass: {}, 暂未用上
      // imgFile: {}, // 上传的图片文件 暂未用上
      // imgSrc: '', // 上传后保存的图片路径 暂未用上
      // demo变量结束

      pressing: false, // 是否处于按压状态
      // canvasW: '1508px',
      canvasW: '764.73px',
      canvasH: '700px',
      selectChild: false,
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
      mapOrigin: {
        width: '',
        height: ''
      },
      drawArea: '', // canvas画布对象
      bottomMap: '',
      activeModule: null,
      showChild: null,
      activeChild: null,
      drawType: null,
      specActive: null,
      drawSpec: [
        {
          key: 'subregion',
          text: '工作区域',
          className: 'workArea',
          type: 'rectangle'
        },
        {
          key: 'virtualWall',
          text: '虚拟墙',
          className: 'virtualWall',
          type: 'wall'
        },
        {
          key: 'obstacle',
          text: '障碍物',
          className: 'obstacle',
          type: 'polygon'
        }
      ],
      drawModule: [
        {
          key: 'workStation',
          text: '工作站',
          className: 'workstation',
          child: [
            {
              key: 'workStation',
              text: '工作站',
              className: 'workstation'
            },
            {
              key: 'workstationSupply',
              text: '工作站补给点',
              className: 'workstation-supply'
            },
            {
              key: 'workstationAwait',
              text: '工作站待机点',
              className: 'workstation-await'
            },
            {
              key: 'workstationFront',
              text: '工作站前方',
              className: 'workstation-front'
            }
          ]
        },
        {
          key: 'map',
          text: '地图出入口',
          className: 'map-in',
          child: [
            {
              key: 'mapIn',
              text: '地图入口',
              className: 'map-in'
            },
            {
              key: 'mapOut',
              text: '地图出口',
              className: 'map-out'
            }
          ]
        },
        {
          key: 'lift',
          text: '电梯点',
          className: 'calls-await',
          child: [
            {
              key: 'callsAwait',
              text: '呼梯待机点',
              className: 'calls-await'
            },
            {
              key: 'onElevator',
              text: '乘梯点',
              className: 'on-elevator'
            },
            {
              key: 'offElevator',
              text: '出梯点',
              className: 'off-elevator'
            },
            {
              key: 'transit',
              text: '过渡点',
              className: 'transit'
            }
          ]
        },
        {
          key: 'wall',
          text: '沿墙点',
          className: 'along-wall-start',
          child: [
            {
              key: 'wallStart',
              text: '沿墙开始点',
              className: 'along-wall-start'
            },
            {
              key: 'wallEnd',
              text: '沿墙结束点',
              className: 'along-wall-end'
            }
          ]
        }
      ],
      drawList: { // 右侧图层列表
        subregion: {
          arr: [],
          text: '工作区域',
          type: '10008003'
        },
        virtualWall: {
          arr: [],
          text: '虚拟墙',
          type: '10008004'
        },
        obstacle: {
          arr: [],
          text: '障碍物',
          type: '10008005'
        },
        path: {
          arr: [],
          text: '路径',
          type: '10008001'
        },
        workStation: {
          arr: [],
          text: '工作站',
          img: 'workstation',
          alreadyImg: '',
          type: '10008007'
        },
        workstationSupply: {
          arr: [],
          text: '工作站补给点',
          img: 'workstation-supply',
          alreadyImg: '',
          type: '10008015'
        },
        workstationAwait: {
          arr: [],
          text: '工作站待机点',
          img: 'workstation-await',
          alreadyImg: '',
          type: '10008011'
        },
        workstationFront: {
          arr: [],
          text: '工作站前方',
          img: 'workstation-front',
          alreadyImg: '',
          type: '10008012'
        },
        mapIn: {
          arr: [],
          text: '地图入口',
          img: 'map-in',
          alreadyImg: '',
          type: '10008016'
        },
        mapOut: {
          arr: [],
          text: '地图出口',
          img: 'map-out',
          alreadyImg: '',
          type: '10008017'
        },
        callsAwait: {
          arr: [],
          text: '呼梯待机点',
          img: 'calls-await',
          alreadyImg: '',
          type: '10008008'
        },
        onElevator: {
          arr: [],
          text: '乘梯点',
          img: 'on-elevator',
          alreadyImg: '',
          type: '10008010'
        },
        offElevator: {
          arr: [],
          text: '出梯点',
          img: 'off-elevator',
          alreadyImg: '',
          type: '10008009'
        },
        transit: {
          arr: [],
          text: '过渡点',
          img: 'transit',
          alreadyImg: '',
          type: '10008006'
        },
        wallStart: {
          arr: [],
          text: '沿墙开始点',
          img: 'along-wall-start',
          alreadyImg: '',
          type: '10008013'
        },
        wallEnd: {
          arr: [],
          text: '沿墙结束点',
          img: 'along-wall-end',
          alreadyImg: '',
          type: '10008014'
        }
      },
      saveBtn: false
    }
  },
  async mounted() {
    await this.getBottomImg()
    this.drawArea = new fabric.Canvas('canvas', { selection: null })
    const map = new Image()
    if (!this.bottomMap) {
      this.$message({
        type: 'error',
        message: '没有成功获取到地图'
      })
      return
    }
    map.src = this.bottomMap
    map.onload = () => {
      this.mapOrigin.width = map.width
      this.mapOrigin.height = map.height
      this.scalePercent.x = this.drawArea.width / this.mapOrigin.width
      this.scalePercent.y = this.drawArea.height / this.mapOrigin.height
      this.drawMap({
        left: 0,
        top: 0
      })
    }

    this.drawArea.on('mouse:down', this.mouseDown)
    this.drawArea.on('mouse:move', this.mouseMove)
    this.drawArea.on('mouse:up', this.mouseUp)
    this.drawArea.on('mouse:wheel', (event) => {
      const { pointer, e } = event
      if (this.drawType) { // 选中绘制图形时不允许放大缩小
        this.$message({
          type: 'error',
          message: '选中绘制图形时不允许缩放'
        })
        return
      }
      this.scale(-e.deltaY)
    })
    document.onkeydown = this.back
    this.getMapValue()
    this.readyImg()
    // /robot/getMapMessage/{mapId}
  },
  methods: {
    handleImg(path) {
      // console.log(path)
      return require('@/assets/images/map/' + path + '.png')
    },
    readyImg() {
      for (const key in this.drawList) {
        if (this.drawList[key].img) {
          const readyImg = new Image()
          readyImg.src = this.handleImg(this.drawList[key].img)
          readyImg.onload = () => {
            this.drawList[key].alreadyImg = readyImg
          }
        }
      }
    },
    clickModule(key) {
      this.activeModule = this.activeModule === key ? null : key // 双击取消当前激活
      this.showChild = this.activeModule ? key : null
      this.specActive = null
      // this.activeModule = key
      // this.showChild = key
    },
    clickChild(key) {
      // this.activeModule = null
      this.showChild = null
      this.activeChild = key
      this.drawType = 'icon'
      this.dialogVisible = true
    },
    createDrawIcon() {
      this.$refs.dialogForm.validate(valid => {
        if (valid) {
          const newXY = this.inputCoordinateConvert(Number(this.form.x), Number(this.form.y))
          if (!newXY) { return }
          console.log('转换后坐标', newXY)
          const angle = getDegree(Number(this.form.orientationX), Number(this.form.orientationY), Number(this.form.orientationZ), Number(this.form.orientationW))
          console.log('转换后角度', angle)
          this.drawIcon(newXY, angle)
        } else {
          return false
        }
      })
    },
    dialogClose() {
      this.activeModule = null
      this.showChild = null
      this.activeChild = null
      this.drawType = ''
      this.form = { // 重置表单
        x: '',
        y: '',
        z: 0,
        orientationX: 0,
        orientationY: 0,
        orientationZ: '',
        orientationW: ''
      }
      this.dialogVisible = false
    },
    inputCoordinateConvert(x, y) {
      // 获取当前尺寸
      const width = this.mapOrigin.width // this.scalePercent.x * (1 + this.scalePercent.now)
      const height = this.mapOrigin.height // this.scalePercent.y * (1 + this.scalePercent.now)
      // 判断 该坐标是否在当前尺寸内
      if (x < 0 || x > width || y < 0 || y > height) {
        this.$message({
          message: '该坐标不在当前尺寸内'
        })
        return false
      }
      const newPoint = {
        x,
        y: height - y
      }
      return newPoint
    },
    drawTypeChange(e) { // 改变绘画类型
      this.drawType = this.drawType === e ? null : e
      this.drawArea.skipTargetFind = !!e
      if (e === 'pen') {
        // isDrawingMode为true 才可以自由绘画
        this.drawArea.isDrawingMode = true
      } else {
        this.drawArea.isDrawingMode = false
      }
    },
    drawIcon(point, angle) { // 对应图标的图片路径
      const { x, y } = point
      // const img = this.handleImg(this.drawList[this.activeChild].img)
      // console.log(img)
      // const newImg = new Image()
      // newImg.src = img
      // angle >= 0 ? 180 + angle :
      angle = 360 + angle + 180
      // console.log(angle, x, y)
      const imgInstance = new fabric.Image(this.drawList[this.activeChild].alreadyImg, {
        left: this.scalePercent.left + (x * this.scalePercent.x * (1 + this.scalePercent.now)),
        top: this.scalePercent.top + (y * this.scalePercent.y * (1 + this.scalePercent.now)),
        angle, // fabric 只接受正数坐标
        lockScalingX: true,
        lockScalingY: true,
        lockMovementY: true,
        lockMovementX: true,
        lockRotation: true
        // opacity: 0.85
      })
      imgInstance.on('mousedown', e => {
        this.selectChild = true
        console.log(e, '子集被点击了')
      })
      imgInstance.on('mouseup', e => {
        this.selectChild = false
        console.log(e, '子集取消点击')
      })
      this.drawArea.add(imgInstance)
      this.drawList[this.activeChild].arr.push({
        x, // 保存的是原始 输入的距离坐标轴的距离(也就是说在对应坐标轴上能达到的最大的长度)
        y: this.form.y,
        orientationW: Number(this.form.orientationW),
        orientationX: 0,
        orientationY: 0,
        orientationZ: Number(this.form.orientationZ),
        uuid: uuidv4(),
        // 下方是需要用的数据
        el: imgInstance,
        angle,
        calcY: y // 单独表示该计算用的y轴坐标
      })
      this.dialogClose()
    },
    drawPolygon() {
      this.drawType = 'polygon'
      this.polygonMode = true
      // 这里画的多边形，由顶点与线组成
      this.pointArray = [] // 顶点集合  mark
      this.lineArray = [] // 线集合	mark
      this.drawArea.isDrawingMode = false
    },
    readyToDraw(e) {
      this.specActive = this.specActive === e.key ? null : e.key
      this.activeChild = this.activeChild === e.key ? null : e.key
      this.activeModule = null
      this.showChild = null
      // this.drawType = e.type
      if (e.type === 'polygon') {
        this.drawPolygon()
      } else {
        this.drawTypeChange(e.type)
      }
    },
    drawOther(e) {
      // 绘制多边形
      if (this.drawType === 'polygon') {
        this.drawArea.skipTargetFind = false
        // 此段为判断是否闭合多边形，点击红点时闭合多边形
        if (this.pointArray.length > 1) {
        // e.target.id == this.pointArray[0].id 表示点击了初始红点
          if (e.target && e.target.id === this.pointArray[0].id) {
            this.generatePolygon() // 闭合
          }
        }
        // 未点击红点则继续作画
        if (this.polygonMode) {
          this.addPoint(e)
        }
      }
    },
    addPoint(e) {
      const random = Math.floor(Math.random() * 10000)
      const id = new Date().getTime() + random
      const circle = new fabric.Circle({
        radius: 5,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 0.5,
        left: (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
        top: (e.pointer.y || e.e.layerY) / this.drawArea.getZoom(),
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        id: id,
        objectCaching: false
      })
      if (this.pointArray.length === 0) {
        circle.set({
          fill: 'red'
        })
      }
      const points = [
        (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
        (e.pointer.y || e.e.layerY) / this.drawArea.getZoom(),
        (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
        (e.pointer.y || e.e.layerY) / this.drawArea.getZoom()
      ]
      this.line = new fabric.Line(points, {
        strokeWidth: 2,
        fill: '#999999',
        stroke: '#999999',
        class: 'line',
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false
      })
      if (this.activeShape) {
        const pos = this.drawArea.getPointer(e.e)
        const points = this.activeShape.get('points')
        points.push({
          x: pos.x,
          y: pos.y
        })
        const polygon = new fabric.Polygon(points, {
          stroke: '#333333',
          strokeWidth: 1,
          fill: '#cccccc',
          opacity: 0.3,
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
          objectCaching: false
        })
        this.drawArea.remove(this.activeShape)
        this.drawArea.add(polygon)
        this.activeShape = polygon
        this.drawArea.renderAll()
      } else {
        const polyPoint = [
          {
            x: (e.pointer.x || e.e.layerX) / this.drawArea.getZoom(),
            y: (e.pointer.y || e.e.layerY) / this.drawArea.getZoom()
          }
        ]
        const polygon = new fabric.Polygon(polyPoint, {
          stroke: '#333333',
          strokeWidth: 1,
          fill: '#cccccc',
          opacity: 0.3,
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
          objectCaching: false
        })
        this.activeShape = polygon
        this.drawArea.add(polygon)
      }
      this.activeLine = this.line
      this.pointArray.push(circle)
      this.lineArray.push(this.line)
      this.drawArea.add(this.line)
      this.drawArea.add(circle)
    },
    generatePolygon() {
      // 原代码
      const points = []
      this.pointArray.map((point, index) => {
        points.push({
          x: point.left,
          y: point.top
        })
        this.drawArea.remove(point)
      })
      this.lineArray.map((line, index) => {
        this.drawArea.remove(line)
      })
      this.drawArea.remove(this.activeShape).remove(this.activeLine)
      const polygon = new fabric.Polygon(points, {
        stroke: this.color,
        strokeWidth: this.drawWidth,
        fill: 'rgba(255, 255, 255, 0)',
        opacity: 1,
        hasBorders: true,
        hasControls: false,
        lockScalingX: true,
        lockScalingY: true,
        lockMovementY: true,
        lockMovementX: true,
        lockRotation: true
      })
      this.drawArea.add(polygon)
      this.activeLine = null
      this.activeShape = null
      this.polygonMode = false
      this.doDrawing = false
      this.drawType = null
      // 原代码结束
      this.specActive = null
      this.drawList[this.activeChild].arr.push({
        el: polygon,
        uuid: uuidv4()
      })
      this.activeChild = null
    },
    drawing(e) { // 通用其他绘制
      if (this.drawingObject) {
        this.drawArea.remove(this.drawingObject)
      }
      let	canvasObject = null
      const left = this.pressOrigin.x
      const top = this.pressOrigin.y
      const mouseTo = e.pointer
      if (this.drawType === 'wall') {
        const x1 = left
        const y1 = top
        const x2 = mouseTo.x
        const y2 = mouseTo.y
        const path = ' M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 + ' Z '
        // console.log(path)
        this.drawingObject = canvasObject
        canvasObject = new fabric.Path(path, {
          stroke: this.color,
          fill: this.color,
          strokeWidth: this.drawWidth
        })
      }
      if (this.drawType === 'arrow') { // 箭头
        const x1 = left
        const y1 = top
        const x2 = mouseTo.x
        const y2 = mouseTo.y
        const w = x2 - x1
        const h = y2 - y1
        const sh = Math.cos(Math.PI / 4) * 16
        const sin = h / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
        const cos = w / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
        const w1 = (16 * sin) / 4
        const h1 = (16 * cos) / 4
        const centerx = sh * cos
        const centery = sh * sin
        /**
        * centerx,centery 表示起始点，终点连线与箭头尖端等边三角形交点相对x，y
        * w1 ，h1用于确定四个点
        */
        let path = ' M ' + x1 + ' ' + y1
        path += ' L ' + (x2 - centerx + w1) + ' ' + (y2 - centery - h1)
        path += ' L ' + (x2 - centerx + w1 * 2) + ' ' + (y2 - centery - h1 * 2)
        path += ' L ' + x2 + ' ' + y2
        path += ' L ' + (x2 - centerx - w1 * 2) + ' ' + (y2 - centery + h1 * 2)
        path += ' L ' + (x2 - centerx - w1) + ' ' + (y2 - centery + h1)
        path += ' Z'
        canvasObject = new fabric.Path(path, {
          stroke: this.color,
          fill: this.color,
          strokeWidth: this.drawWidth
        })
      }
      if (this.drawType === 'pentagram') { // 五角星
        const x1 = left
        const y1 = top
        const x2 = mouseTo.x
        const y2 = mouseTo.y
        /**
        * 实现思路  (x1,y1)表示鼠标起始的位置 (x2,y2)表示鼠标抬起的位置
        * r 表示五边形外圈圆的半径，这里建议自己画个图理解
        * 正五边形夹角为36度。计算出cos18°，sin18°备用
        */
        const w = Math.abs(x2 - x1)
        const h = Math.abs(y2 - y1)
        const r = Math.sqrt(w * w + h * h)
        const cos18 = Math.cos(18 * Math.PI / 180)
        const sin18 = Math.sin(18 * Math.PI / 180)
        /**
        * 算出对应五个点的坐标转化为路径
        */
        const point1 = [x1, y1 + r]
        const point2 = [x1 + 2 * r * (sin18), y1 + r - 2 * r * (cos18)]
        const point3 = [x1 - r * (cos18), y1 + r * (sin18)]
        const point4 = [x1 + r * (cos18), y1 + r * (sin18)]
        const point5 = [x1 - 2 * r * (sin18), y1 + r - 2 * r * (cos18)]
        let path = ' M ' + point1[0] + ' ' + point1[1]
        path += ' L ' + point2[0] + ' ' + point2[1]
        path += ' L ' + point3[0] + ' ' + point3[1]
        path += ' L ' + point4[0] + ' ' + point4[1]
        path += ' L ' + point5[0] + ' ' + point5[1]
        path += ' Z'
        canvasObject = new fabric.Path(path, {
          stroke: this.color,
          fill: this.color,
          strokeWidth: this.drawWidth
          // angle:180,  //设置旋转角度
        })
      }
      if (this.drawType === 'ellipse') { // 椭圆
        // 按shift时画正圆，只有在鼠标移动时才执行这个，所以按了shift但是没有拖动鼠标将不会画圆
        if (e.e.shiftKey) {
          mouseTo.x - left > mouseTo.y - top ? mouseTo.y = top + mouseTo.x - left : mouseTo.x = left + mouseTo.y - top
        }
        const radius =
          Math.sqrt(
            (mouseTo.x - left) * (mouseTo.x - left) +
          (mouseTo.y - top) * (mouseTo.y - top)
          ) / 2
        canvasObject = new fabric.Ellipse({
          left: (mouseTo.x - left) / 2 + left,
          top: (mouseTo.y - top) / 2 + top,
          stroke: this.color,
          fill: 'rgba(255, 255, 255, 0)',
          originX: 'center',
          originY: 'center',
          rx: Math.abs(left - mouseTo.x) / 2,
          ry: Math.abs(top - mouseTo.y) / 2,
          strokeWidth: this.drawWidth
        })
      }
      if (this.drawType === 'rectangle') { // 长方形
        if (left === '' || top === '') {
          return
        }
        // 按shift时画正方型
        if (e.e.shiftKey) {
          mouseTo.x - left > mouseTo.y - top ? mouseTo.y = top + mouseTo.x - left : mouseTo.x = left + mouseTo.y - top
        }
        const path =
          'M ' +
          left +
          ' ' +
          top +
          ' L ' +
          mouseTo.x +
          ' ' +
          top +
          ' L ' +
          mouseTo.x +
          ' ' +
          mouseTo.y +
          ' L ' +
          left +
          ' ' +
          mouseTo.y +
          ' L ' +
          left +
          ' ' +
          top +
          ' z'
        canvasObject = new fabric.Path(path, {
          left: left,
          top: top,
          stroke: this.color,
          strokeWidth: this.drawWidth,
          fill: 'rgba(255, 255, 255, 0)',
          hasControls: false
        })
        // 也可以使用fabric.Rect
      }
      if (this.drawType === 'text') { // 文本框
        this.textbox = new fabric.Textbox('', {
          left: left,
          top: top - 10,
          // width: 150,
          fontSize: 16,
          borderColor: this.color,
          fill: this.color,
          hasControls: false
        })
        this.drawArea.add(this.textbox)
        this.textbox.enterEditing()
        this.textbox.hiddenTextarea.focus()
      }
      if (canvasObject) {
        // canvasObject.index = getCanvasObjectIndex();
        this.drawArea.add(canvasObject) // .setActiveObject(canvasObject)
        this.drawingObject = canvasObject
        // this.drawList[this.activeChild].arr.push(canvasObject)
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
      // console.log(this.drawArea)
      // fabric.Image.fromURL(map, (img)=>{
      //         // add background image

      // });
    },
    scale(num) {
      const scaleBefore = this.scalePercent.before
      const scaleBeforeOrigin = {}
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
        scaleBeforeOrigin.x = this.scalePercent.left || 0
        scaleBeforeOrigin.y = this.scalePercent.top || 0
        this.scalePercent.left = (this.scalePercent.left * this.scalePercent.now) / this.scalePercent.before
        this.scalePercent.top = (this.scalePercent.top * this.scalePercent.now) / this.scalePercent.before
        this.scalePercent.before = this.scalePercent.now
      }
      if (this.scalePercent.now === 0) { // 还原此时原点
        this.scalePercent.left = 0
        this.scalePercent.top = 0
      }
      this.handleModuleChange('scale', scaleBefore)
      this.drawMap({
        // left: this.scalePercent.left,
        // top: this.scalePercent.top,
        x: this.scalePercent.x * (1 + this.scalePercent.now), // 换算百分比
        y: this.scalePercent.y * (1 + this.scalePercent.now) // 换算百分比
      })
    },
    mouseDown(e) {
      console.log(e)
      // 原代码
      // var xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY);
      // this.mouseFrom.x = xy.x; // 需要修改的变量
      // this.mouseFrom.y = xy.y; // 需要修改的变量
      this.doDrawing = true
      // 暂时用不到的代码
      // if (this.drawType == "text") {
      //   this.drawing();
      // }
      // if (this.textbox) {
      //   this.textbox.enterEditing();
      //   this.textbox.hiddenTextarea.focus();
      // }
      this.pressing = true
      // 原代码结束
      this.selectChild = false
      const { x, y } = e.pointer
      this.pressOrigin.x = x // this.mouseFrom.x
      this.pressOrigin.y = y // this.mouseFrom.y
      if (this.drawType) { // 执行对应drawType的任务
        this.drawOther(e)
      }
    },
    mouseMove(move) {
      // 原代码
      // if (this.moveCount % 2 && !this.doDrawing) {
      //   //减少绘制频率
      //   return;
      // }
      // this.moveCount++;
      // var xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY);
      // this.mouseTo.x = xy.x;
      // this.mouseTo.y = xy.y;
      // // 多边形与文字框	特殊处理
      // if (this.drawType != "text" || this.drawType != "polygon") { // 暂时没用到的代码
      //   this.drawing(e);
      // }
      // if (this.drawType == "polygon") {
      //   if (this.activeLine && this.activeLine.class == "line") {
      //     var pointer = this.canvas.getPointer(e.e);
      //     this.activeLine.set({ x2: pointer.x, y2: pointer.y });
      //     var points = this.activeShape.get("points");
      //     points[this.pointArray.length] = {
      //       x: pointer.x,
      //       y: pointer.y,
      //       zIndex: 1
      //     };
      //     this.activeShape.set({
      //       points: points
      //     });
      //     this.canvas.renderAll();
      //   }
      //   this.canvas.renderAll();
      // }
      // 原代码结束
      if (this.drawType) { // 选中有绘画类型时不允许移动
        // 多边形与文字框特殊处理
        if (this.drawType !== 'text' && this.drawType !== 'polygon') {
          this.drawing(move)
        }
        if (this.drawType === 'polygon') {
          if (this.activeLine && this.activeLine.class === 'line') {
            const pointer = this.drawArea.getPointer(move.e)
            this.activeLine.set({ x2: pointer.x, y2: pointer.y })
            const points = this.activeShape.get('points')
            points[this.pointArray.length] = {
              x: pointer.x,
              y: pointer.y,
              zIndex: 1
            }
            this.activeShape.set({
              points: points
            })
            this.drawArea.renderAll()
          }
          this.drawArea.renderAll()
        }
        return
      }
      // 移动操作
      if (this.selectChild) { // 选中子集时不能移动
        return
      }
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
      this.handleModuleChange('move', { moveX, moveY })
      this.drawMap({
        // left: this.scalePercent.left * (1 + this.scalePercent.now),
        // top: this.scalePercent.top * (1 + this.scalePercent.now),
        x: this.scalePercent.x * (1 + this.scalePercent.now),
        y: this.scalePercent.y * (1 + this.scalePercent.now),
        move: { moveX, moveY }
      })
      this.pressOrigin.x = move.pointer.x
      this.pressOrigin.y = move.pointer.y
    },
    mouseUp(e) {
      // 原代码
      // var xy = e.pointer || this.transformMouse(e.e.offsetX, e.e.offsetY);
      // this.mouseTo.x = xy.x;
      // this.mouseTo.y = xy.y;
      if (this.drawType && this.drawType !== 'polygon') {
        this.specActive = null
        this.drawType = null
      }
      if (this.drawingObject) {
        this.drawList[this.activeChild].arr.push({
          el: this.drawingObject,
          uuid: uuidv4(),
          percent: this.scalePercent.now + 1,
          createOriginX: this.scalePercent.left,
          createOriginY: this.scalePercent.top
        })
        this.drawingObject = null
      }
      if (this.drawType !== 'polygon') {
        this.doDrawing = false
      }

      // 原代码结束
      this.pressing = false
      // this.drawArea.__eventListeners["mouse:move"] = []
      // if(!this.drawType){ // 只有当绘制结束,清除原点
      this.pressOrigin.x = ''
      this.pressOrigin.y = ''
      // }
    },
    back(e) {
      if (e.keyCode === 90 && e.ctrlKey) {
        this.drawArea.remove(
          this.drawArea.getObjects()[this.drawArea.getObjects().length - 1]
        )
      }
    },
    handleModuleChange(type, before) { // icon只有坐标变化 特殊原点以及宽高也需要变化
      if (type === 'scale') {
        for (const key in this.drawList) {
          if (this.drawList[key].arr.length) {
            if (this.drawList[key].img) { // icon
              this.drawList[key].arr.forEach(item => {
                const scaleX = (this.scalePercent.x * item.x * (this.scalePercent.now + 1)) + this.scalePercent.left
                const scaleY = (this.scalePercent.y * item.calcY * (this.scalePercent.now + 1)) + this.scalePercent.top
                const imgInstance = new fabric.Image(this.drawList[key].alreadyImg, {
                  // (((i[1] + x) * (this.scalePercent.now + 1)) / item.percent + this.scalePercent.left)
                  left: scaleX,
                  top: scaleY,
                  angle: item.angle, // fabric 只接受正数坐标
                  lockScalingX: true,
                  lockScalingY: true,
                  lockMovementY: true,
                  lockMovementX: true,
                  lockRotation: true
                  // opacity: 0.85
                })
                item.createOriginX = scaleX
                item.createOriginY = scaleY
                console.log(item.createOriginX, item.createOriginY)
                item.percent = this.scalePercent.now + 1
                imgInstance.on('mousedown', e => {
                  this.selectChild = true
                  console.log(e, '子集被点击了')
                })
                imgInstance.on('mouseup', e => {
                  this.selectChild = false
                  console.log(e, '子集取消点击')
                })
                this.drawArea.remove(item.el)
                this.drawArea.add(imgInstance)
                this.drawArea.moveTo(imgInstance, 2)
                item.el = imgInstance
              })
            } else {
              this.drawList[key].arr.forEach(item => {
                const x = Math.abs(item.createOriginX) // 得出当时原点的偏移量
                const y = Math.abs(item.createOriginY)
                let start; let middle; const end = ' Z'
                item.el.path.forEach((i, index) => {
                  // console.log('绘制前:', i[1], i[2], this.scalePercent.now, item.percent)
                  // console.log('绘制后:', (i[1] * (this.scalePercent.now + 1)) / item.percent, (i[2] * (this.scalePercent.now + 1)) / item.percent + 1)
                  if (index === 0) {
                    start = ' M ' +
                    (((i[1] + x) * (this.scalePercent.now + 1)) / item.percent + this.scalePercent.left) + ' ' +
                    (((i[2] + y) * (this.scalePercent.now + 1)) / item.percent + this.scalePercent.top)
                  }
                  if (index !== (item.el.path.length - 1) && index !== 0) {
                    middle = middle
                      ? middle + ' L ' +
                      (((i[1] + x) * (this.scalePercent.now + 1)) / item.percent + this.scalePercent.left) + ' ' +
                      (((i[2] + y) * (this.scalePercent.now + 1)) / item.percent + this.scalePercent.top)
                      : ' L ' +
                      (((i[1] + x) * (this.scalePercent.now + 1)) / item.percent + this.scalePercent.left) + ' ' +
                      (((i[2] + y) * (this.scalePercent.now + 1)) / item.percent + this.scalePercent.top)
                  }
                })
                const path = start + middle + end
                // console.log(path)
                this.drawArea.remove(item.el)
                const newPath = new fabric.Path(path, {
                  stroke: this.color,
                  fill: 'transparent',
                  strokeWidth: this.drawWidth
                })
                this.drawArea.add(newPath)
                this.drawArea.moveTo(newPath, 2)
                item.el = newPath
              })
            }
          }
        }
      }
      if (type === 'move') {
        const { moveX, moveY } = before
        for (const key in this.drawList) {
          if (this.drawList[key].arr.length) {
            if (this.drawList[key].img) {
              this.drawList[key].arr.forEach(item => {
                const imgInstance = new fabric.Image(this.drawList[key].alreadyImg, {
                  left: moveX + item.x,
                  top: moveY + item.y,
                  angle: item.angle, // fabric 只接受正数坐标
                  lockScalingX: true,
                  lockScalingY: true,
                  lockMovementY: true,
                  lockMovementX: true,
                  lockRotation: true
                  // opacity: 0.85
                })
                imgInstance.on('mousedown', e => {
                  this.selectChild = true
                  console.log(e, '子集被点击了')
                })
                imgInstance.on('mouseup', e => {
                  this.selectChild = false
                  console.log(e, '子集取消点击')
                })
                this.drawArea.remove(item.el)
                this.drawArea.add(imgInstance)
                this.drawArea.moveTo(imgInstance, 2)
                item.el = imgInstance
              })
            } else {
              this.drawList[key].arr.forEach(item => {
                let start; let middle; const end = ' Z'
                item.el.path.forEach((i, index) => {
                  if (index === 0) {
                    start = ' M ' + (moveX + i[1]) + ' ' + (moveY + i[2])
                  }
                  if (index !== (item.el.path.length - 1)) {
                    middle = middle
                      ? middle + ' L ' + (moveX + i[1]) + ' ' + (moveY * +i[2])
                      : ' L ' + (moveX * +i[1]) + ' ' + (moveY + i[2])
                  }
                })
                const path = start + middle + end
                // console.log(path)
                this.drawArea.remove(item.el)
                const newPath = new fabric.Path(path, {
                  stroke: this.color,
                  fill: 'transparent',
                  strokeWidth: this.drawWidth
                })
                this.drawArea.add(newPath)
                this.drawArea.moveTo(newPath, 2)
                item.el = newPath
              })
            }
          }
        }
      }
    },
    test2() {
      // this.testMqtt.sub({ topic: '/cloud/web/elevator/00000000000/status/push' })
    },
    test() {
      // const obj = this.$link()
      // this.testMqtt = obj.link
      // this.testMqtt.connect(obj.options)
      // setTimeout(() => {
      //   this.testMqtt.disconnect()
      // }, 15000)
      // console.log(this.drawList)
    },
    async getMapValue() {
      const data = await this.$https.get(`/getMapMessage/${this.mapId}`)
      console.log(data)
      if (!data.data) {
        this.$message({
          type: 'error',
          message: '没有获取到障碍物信息'
        })
      }
    },
    async save() {
      if (this.saveBtn) {
        this.$message({
          type: 'error',
          message: '正在提交中,请稍后'
        })
        return
      }
      const { width, height } = this.mapOrigin
      let req = {
        attribute: {
          // createTime: 0,
          width,
          height
          // mapName: "",
          // mapDescription: "",
          // organizationId: "",
          // resolutionX: 0,
          // resolutionY: 0,
          // updateTime": 0,
        },
        mapId: this.mapId,
        point: []
        // serverMapId: "",
      }
      for (const key in this.drawList) {
        if (this.drawList[key].arr.length) {
          if (this.drawList[key].img) { // icon特殊处理
            this.drawList[key].arr.forEach(item => {
              req.point.push({
                point: {
                  // 仅保存输入时的数据
                  x: item.x,
                  y: item.y,
                  z: 0,
                  orientationW: item.orientationW,
                  orientationX: item.orientationX,
                  orientationY: item.orientationY,
                  orientationZ: item.orientationZ
                },
                pointId: item.uuid,
                pointType: this.drawList[key].type
                // pointDescription: "", // 描述
                // pointName: "", // 名称
                // subregionId: "" // 地图分区id
              })
            })
          } else {
            req[key] = []
            this.drawList[key].arr.forEach(item => {
              const obj = {
                points: [],
                [key + 'Id']: item.uuid,
                [key + 'Type']: this.drawList[key].type
                // obj[key+'Name']:'',
                // obj[key+'Description']:'',
              }
              item.el.path.forEach(i => {
                if (i[1] && i[2]) {
                  obj.points.push({
                    x: i[1],
                    y: i[2],
                    z: 0
                    // 	"orientationW": 0,
                    // 	"orientationX": 0,
                    // 	"orientationY": 0,
                    // 	"orientationZ": 0,
                  })
                }
              })
              req[key].push(obj)
            })
          }
        }
      }
      console.log('提交前数据', req)
      this.saveBtn = true
      req = JSON.stringify(req)
      const data = await this.$https.post(`/map/allModifyMapMessage/${this.mapId}`, req)
      console.log(data)
    },

    async getBottomImg() {
      const img = await bottomImg(this.mapId)
      if (!img.data) {
        this.$message({
          message: img.message || '没有找到该文件',
          type: 'error'
        })
        return
      }
      const base64 = img.data && 'data:image/jpeg;base64,' + img.data
      this.bottomMap = base64

      // 测试用数据,
      // this.bottomMap = require('../../map.')
    }
  }
}

</script>

<style lang="less" scoped>
/* @import url(); 引入css类 */
@import url('../../../styles/signMap.css');
/deep/.el-scrollbar .el-scrollbar__wrap {
	overflow-x: hidden;
}

.dialog-container /deep/ .el-form .el-form-item {
  margin-bottom: 15px !important
}

.done.active {
	background: #00cc89 !important;
	cursor: pointer !important;
}

.resore.active {
	background: #409eff !important;
	cursor: pointer !important;
}

.workArea.listActive {
	background: #fff url('../../../assets/images/map/work-area.png') no-repeat
		20px !important;
}

.virtualWall.listActive {
	background: #fff url('../../../assets/images/map/virtual-wall.png') no-repeat
		20px !important;
}

.obstacle.listActive {
	background: #fff url('../../../assets/images/map/obstacle.png') no-repeat 20px !important;
}

.workstation.listActive {
	background: #fff url('../../../assets/images/map/workstation1.png') no-repeat
		20px !important;
}

.workstation-supply.listActive {
	background: #fff url('../../../assets/images/map/workstation-supply1.png')
		no-repeat 20px !important;
}

.workstation-await.listActive {
	background: #fff url('../../../assets/images/map/workstation-await1.png')
		no-repeat 20px !important;
}

.workstation-front.listActive {
	background: #fff url('../../../assets/images/map/workstation-front1.png')
		no-repeat 20px !important;
}

.map-in.listActive {
	background: #fff url('../../../assets/images/map/map-in1.png') no-repeat 20px !important;
}

.map-out.listActive {
	background: #fff url('../../../assets/images/map/map-out1.png') no-repeat 20px !important;
}

.calls-await.listActive {
	background: #fff url('../../../assets/images/map/calls-await1.png') no-repeat
		20px !important;
}

.on-elevator.listActive {
	background: #fff url('../../../assets/images/map/on-elevator1.png') no-repeat
		20px !important;
}

.off-elevator.listActive {
	background: #fff url('../../../assets/images/map/off-elevator1.png') no-repeat
		20px !important;
}

.transit.listActive {
	background: #fff url('../../../assets/images/map/transit1.png') no-repeat 20px !important;
}

.along-wall-start.listActive {
	background: #fff url('../../../assets/images/map/along-wall-start1.png')
		no-repeat 20px !important;
}

.along-wall-end.listActive {
	background: #fff url('../../../assets/images/map/along-wall-end1.png')
		no-repeat 20px !important;
}

.revoke.liActive {
	cursor: pointer !important;
	background: url('../../../assets/images/map/revoke1.png') no-repeat 0 20px !important;
}

.repeat.liActive {
	cursor: pointer !important;
	background: url('../../../assets/images/map/repeat1.png') no-repeat 0 20px !important;
}

.entry.listActive,
.exit.listActive {
	background-color: #dbedff !important;
	opacity: 1 !important;
}

.hidden {
	display: none;
}
input[type='text']:focus {
	border-color: #409eff !important;
}


</style>
