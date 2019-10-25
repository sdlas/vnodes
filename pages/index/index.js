//index.js
//获取应用实例
const app = getApp()
//注意事项:当有电阻串联时，要么将电阻合成一个来算，要么在两个电阻中间再加一个结点,在输入与参考节点相连的电压源时记得自取正负，并且总是以参考节点0为根结点
Page({
  data: {
    badnodeslist:[],//存储中间夹有电压源的结点组
    result:[],//最终结果
    nodenum:0,//结点数
    matrix: [[1, 5, 0, 1], [4, 5, 0, 1], [0, 0, 6, 1], [0, 0, 6, 1]],
    matrix2: [[1, 5], [4, 5]],
    currentid:0,
    showadd:false,//是否显示增加元件的窗口
    itemlist:[],//元件列表
  },
  calculate:function(e){
    var that = this
    var height = that.data.nodenum
    var mheight = height-1
    var calid = new Array()//初始化所有要求解的结点
    for(let k=0;k<mheight;k++){
      calid[k]=k+1
    }
    var itemlist=that.data.itemlist
    var Rresult = new Array();
    var Iresult = new Array();
    
    var badnodeslist = that.data.badnodeslist
    var badnodesid = new Array()//存储所有无伴电压源结点
    var Vbadnodes = new Array()//存储所有无伴电压源电压
    for (let i = 0; i < height; i++) {//查找bad_nodes,即结点之间是一个电压源
      for (let j = height-1; j > i; j--) {//i>j节省运算成本
        var badnodes = { startnode: '', endnode: '' }
        for (var p in itemlist) {
          if (itemlist[p].id == 1) {
            if (itemlist[p].nodestart == i && itemlist[p].nodeend == j) {
              badnodes.startnode = i
              for(let m=0;m<calid.length;m++){
                if(calid[m]==j){
                  badnodesid.push(calid[m])//向无伴电压源结点中添加
                  calid.splice(m,1)//向求解结点中添加
                }
              }
              badnodes.startnode = j
              badnodeslist.push(badnodes)
              Vbadnodes.push(itemlist[p].num)
            }
          }
        }
      }
    }
    if (badnodeslist == '') { 
      for (let k = 0; k < mheight; k++) {//生成比总的结点数少一的矩阵
        Rresult[k] = new Array()
        Iresult[k] = new Array()
      }
      for (let i = 0; i < mheight; i++) {//获取自阻矩阵
        var Uid = i + 1//结点id
        for (let j = 0; j < mheight; j++) {
          var Uid2 = j + 1//纵向结点id
          var Rsum = 0;
          if (Uid2 == Uid) {//如果当前结点时自阻
            for (var p in itemlist) {
              if (itemlist[p].id == 0) {
                if (itemlist[p].nodestart == Uid || itemlist[p].nodeend == Uid) {
                  Rsum = Rsum + 1 / parseInt(itemlist[p].num)
                }
              }
            }
          } else {//是互阻，i+1作为起始结点，j+1作为结束结点
            for (var p in itemlist) {
              if (itemlist[p].id == 0) {
                if ((itemlist[p].nodestart == Uid && itemlist[p].nodeend == Uid2) || (itemlist[p].nodestart == Uid2 && itemlist[p].nodeend == Uid)) {
                  Rsum = Rsum - 1 / parseInt(itemlist[p].num)
                }
              }
            }
          }
          Rresult[i][j] = Rsum
        }
      }
      for (let i = 0; i < mheight; i++) {//获取电流矩阵
        var Uid = i + 1
        var Isum = 0;
        for (var p in itemlist) {
          console.log("why")
          if (itemlist[p].id == 2) {
            if (itemlist[p].nodestart == Uid) {
              Isum = Isum + parseInt(itemlist[p].num)
            }
            if (itemlist[p].nodeend == Uid) {
              Isum = Isum - parseInt(itemlist[p].num)
            }
          }
        }
        Iresult[i][0] = Isum
      }
      var temp = that.inverse(Rresult)
      console.log('temp=', temp)
      var result = that.multiply(Rresult, Iresult)
    } else {
      var badlength = that.data.badnodeslist.length
      console.log("badlength= ",badlength)
      var mheight = mheight - badlength
      for (let k = 0; k < mheight; k++) {//减去无伴电压源的数量
        Rresult[k] = new Array()
        Iresult[k] = new Array()
      }
      for (let i = 0; i < mheight; i++) {//获取自阻矩阵
        var Uid = calid[i]//结点id
        for (let j = 0; j < mheight; j++) {
          var Uid2 = calid[j]//纵向结点id
          var Rsum = 0;
          if (Uid2 == Uid) {//如果当前结点时自阻
            for (var p in itemlist) {
              if (itemlist[p].id == 0) {
                if (itemlist[p].nodestart == Uid || itemlist[p].nodeend == Uid) {
                  Rsum = Rsum + 1 / parseInt(itemlist[p].num)
                }
              }
            }
          } else {//是互阻，i+1作为起始结点，j+1作为结束结点
            for (var p in itemlist) {
              if (itemlist[p].id == 0) {
                if ((itemlist[p].nodestart == Uid && itemlist[p].nodeend == Uid2) || (itemlist[p].nodestart == Uid2 && itemlist[p].nodeend == Uid)) {
                  Rsum = Rsum - 1 / parseInt(itemlist[p].num)
                }
              }
            }
          }
          Rresult[i][j] = Rsum
        }
      }
      for (let i = 0; i < mheight; i++) {//获取电流矩阵
        var Uid = calid[i]
        var Isum = 0;
        for (var p in itemlist) {
          if (itemlist[p].id == 2) {
            if (itemlist[p].nodestart == Uid) {
              Isum = Isum + parseInt(itemlist[p].num)
            }
            if (itemlist[p].nodeend == Uid) {
              Isum = Isum - parseInt(itemlist[p].num)
            }
          }
        }
        Iresult[i][0] = Isum
      }
      var temp = that.inverse(Rresult)
      var result = that.multiply(Rresult, Iresult)
      //在结果中再添加badnodes的计算结果
      for(let i=0;i<badnodesid.length;i++){
        var id = badnodesid.pop()
        var U = Vbadnodes.pop()
        var Ur = U+result[id-1][0]
        var t = new Array()
        t[0]=Ur
        result.splice(id,0,t)
      }
     
    }
    
    that.setData({
      result:result,
      currentid: 3
    })
    console.log(Rresult,Iresult)
    console.log(result)
  },
  railnum:function(e){
    var that = this
    console.log(e)
    var length=that.data.nodenum
    console.log("len",length)
    var k=new Array();
    console.log(e.detail.value.rail0)
    k[0] = e.detail.value.one_0
    k[1] = e.detail.value.one_1
    k[2] = e.detail.value.one_2//再想办法
    that.setData({
      currentid:3,
      railnum:k
    })
    console.log(k)
    console.log(that.data.railnum)
  },
  add:function(){//增加元件
    var that = this
    that.setData({
      showadd:true
    })
  },
  disshowadd:function(e){//提交增加元件的表单
    var that = this
    let a = { id: '', num: '', nodestart: '', nodeend: ''}
    a.id=e.detail.value.id
    a.num = parseInt(e.detail.value.num)
    a.nodestart = e.detail.value.nodestart
    a.nodeend = e.detail.value.nodeend
      var temp = that.data.itemlist
      temp.push(a)
      that.setData({
        itemlist: temp
      })
    that.setData({
      showadd:false,
    })
    console.log(that.data.itemlist)
  },
  nodenum:function(e){
      var that = this
      that.setData({
        currentid:2,
        nodenum: parseInt(e.detail.value.num)
      })
  },
  start:function(){
    var that = this
    that.setData({
      currentid:1
    })
  },
  adjoint:function(matrix){//求一个矩阵的伴随矩阵
    var that = this
    var length = matrix.length
    if(length==2){//长度为2，另做考虑
      var result = new Array();
      for(let k =0 ;k<2;k++){
        result[k]=new Array()
      } 
      for(let i =0;i<length;i++){
        for(let j =0;j<length;j++){
          if ((i + j) % 2 == 0) { result[i][j] = matrix[1 - i][1 - j]}
          else { result[i][j] = -matrix[1 - j][1 - i]}
        }
      }
    }else{
      var result = new Array();
      for (let k = 0; k < length; k++) {
        result[k] = new Array()
      }
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          var temp = new Array();
          for (let k = 0; k < length - 1; k++) {
            temp[k] = new Array()
          }
          for (let m = 0; m < length - 1; m++) {//ij位置的余子阵
            for (let n = 0; n < length - 1; n++) {
              if (m < i) {
                if (n < j) { temp[m][n] = matrix[m][n] } else { temp[m][n] = matrix[m][n + 1] }
              } else {
                if (n < j) { temp[m][n] = matrix[m + 1][n] } else { temp[m][n] = matrix[m + 1][n + 1] }
              }
            }
          }
          if ((i + j) % 2 == 0) {
            result[i][j] = that.matrixcal(temp)
          } else {
            result[i][j] = -that.matrixcal(temp)
          }
        }
      }
      result = that.transpose(result)
    }
    
    return result;
  },
  transpose:function(matrix){//矩阵转置
    var that = this
    var height=matrix.length
    var width=matrix[0].length
    var result = new Array();
    for(let k=0;k<height;k++){
      result[k]=new Array();
    }
    for(let i=0;i<height;i++){
      for(let j=0;j<width;j++){
        result[j][i]=matrix[i][j]
      }
    }
    return result;
  },
  multiply:function(matrix,matrix2){//输入俩个矩阵，返回俩个矩阵的乘积
    var that = this
    var width=matrix2[0].length//列数
    var height=matrix.length//行数
    var len=matrix[0].length//公共边长度
    var result= new Array();
    for(let k=0;k<height;k++){
      result[k]=new Array();
    }
    for(let i=0;i<height;i++){
      for(let j=0;j<width;j++){
        var sum=0;
        for(let m=0;m<len;m++){
          sum=sum+matrix[i][m]*matrix2[m][j]
        }
            result[i][j]=sum;
      }
    }
    return result;
  },
  inverse:function(matrix){//输入一个矩阵，返回它的逆矩阵
    var that = this 
    var hang = that.matrixcal(matrix)
    var matrix=that.adjoint(matrix)
    var length = matrix.length
    for(let m=0;m<length;m++){
      for(let n=0;n<length;n++){
        if(matrix[m][n]==0){
          matrix[m][n] = 0
        }else{
          matrix[m][n] = matrix[m][n] / hang
        }
      }
    }
    return matrix;
  },
  matrixcal:function(smatrix){//输入一个矩阵,返回它的行列式的值
    var that = this
    var slength=smatrix.length
    var sum=0;
    if(slength==2){//如果输入行列式的长为2则直接运算
     sum=smatrix[0][0]*smatrix[1][1]-smatrix[1][0]*smatrix[0][1]
    }else{
      for (let i = 0; i < slength; i++) {
        var juzhen = new Array()
        for(let p=0;p<slength-1;p++){
          juzhen[p]=new Array()
        }
        for (let m = 0; m < slength - 1; m++) {
          for (let n = 0; n < slength - 1; n++) {
            if (m < i) { 
            juzhen[m][n] = smatrix[m+1][n] }
            else {
            juzhen[m][n] = smatrix[m + 1][n + 1] }
          }
        }//将余子式赋给一个新的矩阵
        if (i % 2 == 0) { sum = smatrix[0][i] * that.matrixcal(juzhen) + sum;}
        else { sum = -smatrix[0][i] * that.matrixcal(juzhen) + sum;}
      }
    }
    return sum;
  },
  onLoad: function () {
    var that = this
  },
})
