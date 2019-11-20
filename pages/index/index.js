//index.js
//获取应用实例
const app = getApp()
//注意事项:当有电阻串联时，要么将电阻合成一个来算，要么在两个电阻中间再加一个结点,在输入与参考节点相连的电压源时记得自取正负，并且总是以参考节点0为根结点,输入在两节点之间的元件通通默认为并联
//对于电流源nodestart是电流的起始，nodeend是电流的结束
//对于电压源nodeend是电压的高电平，nodestart是电压的低电平
Page({
  data: {
    ab: [
      [0.95, -0.5, -0.2], 
      [-0.5, 1.5, -1], 
      [-0.2, -1, 1.5333332]],
    de:[0,1,1],
    Uoc:[],
    Req:[],
    Uitemlist:[],
    Ritemlist:[],
    tab:0,//小运算的menutab
    littlecalresult:[],//小运算结果
    Null:[],//空，用于置空itemlist从而可以重新计算
    inputid:0,//判断输入的是哪个单位
    windowHeight: [],
    windowWidth: [],
    badnodeslist:[],//存储中间夹有电压源的结点组
    result:[],//最终结果
    nodenum:0,//结点数
    // test:[
    //   { id: '3', num1: '1', num2: '90', nodestart: '0', nodeend: '2'},
    //   { id: '2', num: '20', nodestart: '0', nodeend: '3' },
    //   { id: '1', num: '100', nodestart: '0', nodeend: '1' },
    //   { id: '1', num: '110', nodestart: '1', nodeend: '2' },
    //   { id: '0', num: '2', nodestart: '1', nodeend: '3' },
    //   { id: '0', num: '2', nodestart: '3', nodeend: '2' }
    // ],//num1是电阻，num2是电压
    // test2: [
    //   { id: '3', num1: '1', num2: '90', nodestart: '0', nodeend: '2' },
    //   { id: '2', num: '20', nodestart: '0', nodeend: '3' },
    //   { id: '1', num: '100', nodestart: '0', nodeend: '1' },
    //   { id: '1', num: '110', nodestart: '1', nodeend: '2' },
    //   { id: '0', num: '2', nodestart: '1', nodeend: '3' },
    //   { id: '0', num: '10000000', nodestart: '3', nodeend: '2' }
    // ],//num1是电阻，num2是电压
    // test3:[
    //   { id: '0', num: '5', nodestart: '1', nodeend: '2' },
    //   { id: '0', num: '10', nodestart: '2', nodeend: '3' },
    //   { id: '0', num: '3', nodestart: '0', nodeend: '2' },
    //   { id: '4', num: '0.5', nodestart: '0', nodeend: '3',knodestart:'0',knodeend:'2' },
    //   { id: '1', num: '12', nodestart: '0', nodeend: '1' },
    // ],
    // test4:[
    //   { id: '0', num: '10', nodestart: '1', nodeend: '2' },
    //   { id: '0', num: '5', nodestart: '0', nodeend: '2' },
    //   { id: '0', num: '15', nodestart: '2', nodeend: '3' },
    //   { id: '0', num: '8', nodestart: '1', nodeend: '3' },
    //   { id: '1', num: '12', nodestart: '0', nodeend: '1' },
    //   { id: '7', num1: '8',num2:'1', nodestart: '0', nodeend: '3',knodestart:'3',knodeend:'1' },
    // ],
    // test5:[
    //   { id: '0', num: '10', nodestart: '1', nodeend: '2' },
    //   { id: '0', num: '5', nodestart: '0', nodeend: '2' },
    //   { id: '0', num: '15', nodestart: '3', nodeend: '2' },
    //   { id: '0', num: '8', nodestart: '1', nodeend: '3' },
    //   { id: '1', num: '12', nodestart: '0', nodeend: '1' },
    //   { id: '6', num1: '8', num2: '1', nodestart: '0', nodeend: '3', knodestart: '3', knodeend: '1' },
    // ],
    // test6:[
    //   { id: '0', num: '5', nodestart: '1', nodeend: '2' },
    //   { id: '0', num: '10', nodestart: '2', nodeend: '3' },
    //   { id: '0', num: '3', nodestart: '0', nodeend: '2' },
    //   { id: '1', num: '12', nodestart: '0', nodeend: '1' },
    //   { id: '4', num: '12', nodestart: '0', nodeend: '1' },
    // ],
    currentid:0,
    showadd:false,//是否显示增加元件的窗口
    showaddk:false,//是否显示受控源
    itemlist:[],//元件列表
    iscom:false,//是否是有伴电压源
    kong:true,//显示哪个输入框
  },
  kong:function(e){
    var that = this
    if(e.currentTarget.dataset.hi==1){
      that.setData({
        kong:true
      })
    }else{
      that.setData({
        kong:false
      })
    }
  },

  changetab:function(e){//小运算的menutab
    var that = this
    that.setData({
      tab:e.currentTarget.dataset.tabid
    })
  },

  littlecal:function(e){
    var that = this
    var beginid = parseInt(e.detail.value.nodestart)-1
    var endid = parseInt(e.detail.value.nodeend)-1
    var result = that.data.result[beginid]-that.data.result[endid]
    var str = result+'V'
    that.setData({
      littlecalanswer:str
    })
  },

  thevenin:function(e){//计算两个结点的戴维宁等效电路
    var that = this
    var Uitemlist = new Array()
    console.log(Uitemlist)
    var Ritemlist = new Array()
    for(let i =0;i<that.data.itemlist.length;i++){
      Uitemlist.push(that.data.itemlist[i])
      Ritemlist.push(that.data.itemlist[i])
    }
    var itemlist = that.data.itemlist
    var nodestart = parseInt(e.detail.value.nodestart)
    var nodeend = parseInt(e.detail.value.nodeend)
        //计算开路电压Uoc，将两端口在原电路中的所有支路删除，再来连接一个超大的电阻，使其近似得可看作支路，利用节点电压法求出两结点之间的电压差，即为Uoc
          for (var p in Uitemlist) {//删除Uitemlist中连接两端口之间的元件
            if (Uitemlist[p].nodestart == nodestart && Uitemlist[p].nodeend == nodeend) {
              Uitemlist.splice(p, 1)
            }else{
              if (Uitemlist[p].nodestart == nodeend && Uitemlist[p].nodeend == nodestart) {
                Uitemlist.splice(p, 1)
              }
            }
          }
          let a = { id: '', num: '', nodestart: '', nodeend: '' }
          a.id = 0
          a.num = 10000000
          a.nodestart = nodestart
          a.nodeend = nodeend
          Uitemlist.push(a)//在两节点之间接入一个极大的电阻
          var Uresult = that.everycalculate(Uitemlist, that.data.nodenum-1);//调用结点电压法进行计算，得到任意两结点的电压
          var Uoc = Uresult[nodeend - 1][0] - Uresult[nodestart-1][0]//两结点的电压差即为Uoc
          var str = Uoc+'V'
          that.setData({
            Uoc:str
          })
          Uitemlist = null
        // //计算短路电流Isc,将两个输入结点短接后即可将两个结点看作一个新的结点，然后可列出一个高度比原来矩阵高度低1的矩阵，再算出各点的电压，然后再根据此时与原来两个结点之中一个结点相连的支路信息以及通过节点电压法求出的电压，可求出这些支路的电流总和，这些支路的电流总和即为Isc
        //     var Aitemlist = itemlist
        //     //选取与nodestart相连，却不与nodeend相连的所有支路，并将其存入一个json数组
        //     var nodestartroad = new Array()//存储与nodestart相连，却不与nodeend相连的所有支路
        //     var chooseit = 1 //nodeStart是否与无伴电压源相连
        //     for(var p in Aitemlist){
        //       if (Aitemlist[p].id == 1 && (Aitemlist[p].nodestart == nodestart || Aitemlist[p].nodeend==nodestart)) choose =0;
        //     }
        //     for(var p in Aitemlist){
        //       if((Aitemlist[p].nodestart==nodestart&&Aitemlist[p].nodeend!=nodeend)||(Aitemlist[p].nodeend==nodestart&&Aitemlist[p].nodestart!=nodeend)){nodestartroad.push(Aitemlist[p])}
        //     }
        //     //删除Aitemlist中连接两端口之间的元件
        //     for (var p in Aitemlist) {
        //       if (Aitemlist[p].nodestart == nodestart && Aitemlist[p].nodeend == nodeend) {
        //         Aitemlist.splice(p, 1)
        //       }
        //       if (Aitemlist[p].nodestart == nodeend && Aitemlist[p].nodeend == nodestart) {
        //         Aitemlist.splice(p, 1)
        //       }
        //     }
        //     //将剩余结点包含了结点nodestart与nodeend的全部
        //     //判断两个结点的id大小
        //     var thesmaller = nodestart //存储较小的结点id
        //     var thebigger = nodestart//存储较大的结点id
        //     var flag = 1 // nodestart较大
        //     if(nodestart>nodeend){//nodestart大,然后将nodestart的id值全部改为nodeend的id值，然后再将id值大于nodestart的结点值全部减一
        //       for(var p in Aitemlist){
        //         if (Aitemlist[p].nodestart == nodestart) {Aitemlist[p].nodestart=nodeend}
        //         if(Aitemlist[p].nodeend==nodestart) {Aitemlist[p].nodeend = nodeend}
        //       }
        //       for(var p in Aitemlist){
        //         if (Aitemlist[p].nodestart > nodestart) { Aitemlist[p].nodestart--}
        //         if (Aitemlist[p].nodeend > nodestart) { Aitemlist[p].nodestart-- }
        //       }
        //       thesmaller = nodeend
        //       thebigger = nodestart
        //     } else {//nodeend大,然后将nodeend的id值全部改为nodestart的id值，然后再将id值大于nodeend的结点值全部减一
        //       for (var p in Aitemlist) {
        //         if (Aitemlist[p].nodestart == nodestart) { Aitemlist[p].nodestart = nodeend }
        //         if (Aitemlist[p].nodeend == nodestart) { Aitemlist[p].nodeend = nodeend }
        //       }
        //       for (var p in Aitemlist) {
        //         if (Aitemlist[p].nodestart > nodestart) { Aitemlist[p].nodestart-- }
        //         if (Aitemlist[p].nodeend > nodestart) { Aitemlist[p].nodestart-- }
        //       }
        //       thesmaller = nodestart
        //       thebigger = nodeend
        //       flag = 0
        //     }
        //     //Aitemlist修改完毕，生成了一个新的矩阵,但id全部改变了
        //     var Aheight = that.data.nodenum - 1
        //     var Aresult = that.everycalculate(Aitemlist,Aheight)
        //     var tempAresult = Aresult //存储修改id前的Aresult,用于计算无伴电压源电流

        //     //得到的结果需要修正，将原先修改的id复原
        //     for(let i=Aheight;i>thebigger-1;i--){
        //       Aresult[i][0]=Aresult[i-1][0]
        //     }
        //     Aresult[thebigger-1][0]=Aresult[thesmaller-1][0]

        //     //根据计算得到得结点电压来计算电流
        //     var Isum=0
        //     for(var p in nodestartroad){
        //       if (nodestartroad[p].nodestart==nodestart){//nodestart是该支路的nodestart
        //         switch (nodestartroad[p].id) {
        //           case 0: {//是纯电阻
        //             Isum = Isum + (Aresult[nodestartroad[p].nodeend-1]-Aresult[nodestartroad[p].nodestart-1])/nodestartroad[p].num
        //           }
        //           case 1: {//是无伴电压源,假设流入的电流为i，因为已经求出了所有的结点电压，所以可以列式解出该电流（总感觉绕了什么弯路）这时候似乎要调用修改id前的Aresult与修改id后Aitemlist,这里只能计算整合后的结点只与一个无伴电压源相连的情况，所以如果遇到这种情况我们直接去算另一端（滑稽），因为另一端肯定是没有与无伴电压相连的
        //           //所以如果跳进了这个case就别用这边来算短路电流了

        //           }
        //           case 2:{//是无伴电流源
        //             Isum = Isum - nodestartroad[p].num
        //           }
        //           case 3:{//是有伴电压源
        //             Isum = Isum - nodestartroad[p].num2/nodestartroad[p].num1
        //           }
        //         }
        //       } else {//nodestart是该支路的nodeend

        //       }
            
        //     }

          
        //直接计算Req，将与无伴电压源相连的结点直接变为一个结点，先去掉所有的电流源，再把所有的有伴电压源转化为纯电阻，得出一个新的矩阵
            var Rlength = that.data.nodenum-1//目前的结点个数
          //删除nodestart和nodeend之间的所有支路
          for (var p in Ritemlist) {
            if ((Ritemlist[p].nodestart == nodestart && Ritemlist[p].nodeend == nodeend) || (Ritemlist[p].nodeend == nodestart && Ritemlist[p].nodestart == nodeend)) {
              Ritemlist.splice(p, 1)
            }
          }
            //这里注意一个细节，如果你在遍历这个数组的时候修改这个数组会导致意想不到的结果，所以最好是设一个temp，先修改temp
            for(var p in Ritemlist){
              if(Ritemlist[p].id==1){//如果该支路是个无伴电压源
                var thebegin = Ritemlist[p].nodestart
                var theend = Ritemlist[p].nodeend
                //第一步,删除这两个结点之间的所有支路
                for(var q in Ritemlist){
                  if ((Ritemlist[q].nodestart == thebegin && Ritemlist[q].nodeend == theend) || (Ritemlist[q].nodeend == thebegin && Ritemlist[q].nodestart == theend)){
                    Ritemlist.splice(q,1)
                  }
                }
                //第二步求出两个结点id较大的一个，然后修改所有id值,修改id时注意将nodestart与nodeend的id也要同步修改！！！注意这里修改了nodestart的值，所以后面的程序调用的时候要注意了
                var thesmaller = thebegin
                var thebigger = thebegin
                if(thebegin>theend){
                  thebigger = thebegin
                  thesmaller = theend
                  for(var q in Ritemlist){
                    if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart=thesmaller}
                    if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
                    if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart--}
                    if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
                  }
                }else{
                  thebigger = theend
                  thesmaller = thebegin
                  for (var q in Ritemlist) {
                    if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart = thesmaller }
                    if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
                    if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart-- }
                    if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
                  }
                }
                //改变了nodestart和nodeend指向的位置
                if (nodestart == thebigger) { nodestart = thesmaller }
                if (nodestart > thebigger) { nodestart = nodestart - 1 }
                if (nodeend == thebigger) { nodeend = thesmaller }
                if (nodeend > thebigger) { nodeend = nodeend-1 }
                //第三步，将Rlength减一，结束战斗
                Rlength=Rlength-1;
                break;
              }
            }
            //再执行一次，防止一个结点连接了两个无伴电压源
            for (var p in Ritemlist) {
            if (Ritemlist[p].id == 1) {//如果该支路是个无伴电压源
              var thebegin = Ritemlist[p].nodestart
              var theend = Ritemlist[p].nodeend
              //第一步,删除这两个结点之间的所有支路
              for (var q in Ritemlist) {
                if ((Ritemlist[q].nodestart == thebegin && Ritemlist[q].nodeend == theend) || (Ritemlist[q].nodeend == thebegin && Ritemlist[q].nodestart == theend)) {
                  Ritemlist.splice(q, 1)
                }
              }
              //第二步求出两个结点id较大的一个，然后修改所有id值,修改id时注意将nodestart与nodeend的id也要同步修改！！！注意这里修改了nodestart的值，所以后面的程序调用的时候要注意了
              var thesmaller = thebegin
              var thebigger = thebegin
              if (thebegin > theend) {
                thebigger = thebegin
                thesmaller = theend
                for (var q in Ritemlist) {
                  if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart = thesmaller }
                  if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
                  if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart-- }
                  if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
                }
              } else {
                thebigger = theend
                thesmaller = thebegin
                for (var q in Ritemlist) {
                  if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart = thesmaller }
                  if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
                  if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart-- }
                  if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
                }
              }
              //改变了nodestart和nodeend指向的位置
              if (nodestart == thebigger) { nodestart = thesmaller }
              if (nodestart > thebigger) { nodestart = nodestart - 1 }
              if (nodeend == thebigger) { nodeend = thesmaller }
              if (nodeend > thebigger) { nodeend = nodeend - 1 }
              //第三步，将Rlength减一，结束战斗
              Rlength = Rlength - 1;
              break;
            }
          }
            for(var p in Ritemlist){//删除电流源
              if(Ritemlist[p].id==2){
                Ritemlist.splice(p,1)
              }
            }
            for(var p in Ritemlist){
              if(Ritemlist[p].id==3){
                let m = { id: '', num: '', nodestart: '', nodeend: '' }
                m.id='0'
                m.num=Ritemlist[p].num1
                m.nodestart=Ritemlist[p].nodestart
                m.nodeend=Ritemlist[p].nodeend
                Ritemlist.splice(p,1,m)
              }
            }
            
          //将0结点与nodestart或者nodeend交换
          var which = 'no'
          if (nodestart == 0) { which = 'start' } else {
            if (nodeend == 0) { which = 'no' } else {//如果两个结点id都不为0那就交换nodestart
              for (var p in Ritemlist) {
                if (Ritemlist[p].nodestart == 0) { Ritemlist[p].nodestart = -1 }
                if (Ritemlist[p].nodeend == 0) { Ritemlist[p].nodeend = -1 }
              }
              for (var p in Ritemlist) {
                if (Ritemlist[p].nodestart == nodestart) { Ritemlist[p].nodestart = 0 }
                if (Ritemlist[p].nodeend == nodestart) { Ritemlist[p].nodeend = 0 }
              }
              for (var p in Ritemlist) {
                if (Ritemlist[p].nodestart == -1) { Ritemlist[p].nodestart = nodestart }
                if (Ritemlist[p].nodeend == -1) { Ritemlist[p].nodestart = nodeend }
              }
              //nodestart成功设置为零结点
              nodestart = 0
              which = 'start'
            }
          }
          let I = { id: '', num: '', nodestart: '', nodeend: '' }
          I.id='1'
          I.num='10'
          I.nodestart = nodestart
          I.nodeend = nodeend
          Ritemlist.push(I)//在端点中通入1V的电流源
          //Ritemlist修改完毕，nodestart和nodeend修改完毕，Rlength修改完毕，准备求值
          if(Rlength==1){//如果剩下就一个支路，则电阻就是这个支路的电阻
            var Req = Ritemlist[0].num
          }else{
            var Rresult = that.everycalculate(Ritemlist, Rlength)
            var Isum = 0
            for (var p in Ritemlist) {
              if (Ritemlist[p].id == 0) {
                if (Ritemlist[p].nodestart == 0) { Isum = Isum + Rresult[Ritemlist[p].nodeend - 1] / Ritemlist[p].num }
                if (Ritemlist[p].nodeend == 0) { Isum = Isum + Rresult[Ritemlist[p].nodeend - 1] / Ritemlist[p].num }
              }
            }
            var Req = 10 / Isum
          }
          var str = Req +'Ω'
          that.setData({
            Req: str
          })
  },

  again:function(){//再次进行运算
    var that = this
    that.setData({
      nodenum:0,
      itemlist:that.data.Null,
      currentid:0,
      result:that.data.Null,
      littlecalanswer:that.data.Null
    })
  },

  notcom:function(e){
    var that = this
    that.setData({
      iscom:false,
      inputid:e.currentTarget.dataset.inputid
    })
  },

  iscom:function(){
    var that = this
    that.setData({
      iscom:true
    })
  },

  calculate:function(e){
    var that = this
    var height = that.data.nodenum
    var mheight = height-1
    var itemlist=that.data.itemlist
    var Rresult = new Array();
    var Iresult = new Array();
    var badnodeslist = that.data.badnodeslist//存储一个带三个key值的json，start结点，end结点，两结点之间的值 
    for (let i = 0; i <= height; i++) {//查找bad_nodes,即结点之间是一个电压源
      for (let j = height; j > i; j--) {//i>j节省运算成本
        var badnodes = { nodestart: '', nodeend: '',nodevalue:'' }
        for (var p in itemlist) {
          if (itemlist[p].id == 1) {
            if (itemlist[p].nodestart == i && itemlist[p].nodeend == j) {
              badnodes.nodestart = i
              badnodes.nodeend = j
              badnodes.nodevalue = itemlist[p].num
              badnodeslist.push(badnodes)
            }
          }
        }
      }
    }
      for (let k = 0; k < mheight; k++) {
        Rresult[k] = new Array()
        Iresult[k] = new Array()
      }
      for (let i = 0; i < mheight; i++) {//获取自阻矩阵
        var Uid = i + 1//结点id
        for (let j = 0; j < mheight; j++) {
          var Uid2 = j + 1//纵向结点id
          var Rsum = 0;
          if (Uid2 == Uid) {//如果当前结点是自阻
            for (var p in itemlist) {
              if (itemlist[p].id == 0) {
                if (itemlist[p].nodestart == Uid || itemlist[p].nodeend == Uid) {
                  Rsum = Rsum + 1 / parseInt(itemlist[p].num)
                }
              }
              if (itemlist[p].id == 3) {//有伴电压源的电阻
                if (itemlist[p].nodestart == Uid || itemlist[p].nodeend == Uid) {
                  Rsum = Rsum + 1 / parseInt(itemlist[p].num1)
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
        var id=i+1
        var Isum = 0;
        var Uid=i+1
        for (var p in itemlist) {
          if (itemlist[p].id == 2) {
            if (itemlist[p].nodestart == Uid) {//流出为负
              Isum = Isum - parseInt(itemlist[p].num)
            }
            if (itemlist[p].nodeend == Uid) {//流入为正
              Isum = Isum + parseInt(itemlist[p].num)
            }
          }
          if (itemlist[p].id == 3) {
            if (itemlist[p].nodestart == Uid) {
              Isum = Isum - parseInt(itemlist[p].num2) / parseInt(itemlist[p].num1)
            }
            if (itemlist[p].nodestart == Uid) {
              Isum = Isum + parseInt(itemlist[p].num2) / parseInt(itemlist[p].num1)
            }
          }
        }
        Iresult[i][0] = Isum
      }
      //根据无伴电压源对上述矩阵做修正
      if(badnodeslist!=''){
        for(var p in badnodeslist){
          if(badnodeslist[p].nodestart==0){
            for(let j=0;j<mheight;j++){
              if (j+1 == badnodeslist[p].nodeend){
                Rresult[badnodeslist[p].nodeend-1][j] = 1
                Iresult[badnodeslist[p].nodeend-1][0]=badnodeslist[p].nodevalue
              }else{
                Rresult[badnodeslist[p].nodeend-1][j] = 0
              }
            }
          }else{
            if(badnodeslist[p].nodeend==0){
              for (let j = 0; j < mheight; j++) {
                if (j + 1 == badnodeslist[p].nodeend) {
                  Rresult[badnodeslist[p].nodeend - 1][j] = 1
                  Iresult[badnodeslist[p].nodeend - 1][0] = -badnodeslist[p].nodevalue
                } else {
                  Rresult[badnodeslist[p].nodeend - 1][j] = 0
                }
              }
            }else{
              for (let j = 0; j < mheight; j++) {//改变电压源末端结点的方程，
                if (j + 1 == badnodeslist[p].nodeend) {
                  Rresult[badnodeslist[p].nodeend - 1][j] = 1
                  Iresult[badnodeslist[p].nodeend - 1][0] = badnodeslist[p].nodevalue
                }else{
                  if (j + 1 == badnodeslist[p].nodestart) {
                    Rresult[badnodeslist[p].nodeend - 1][j] = -1
                  }
                  else {
                    Rresult[badnodeslist[p].nodeend - 1][j] = 0
                  }
                }
              }
            }
          }
        }
      }
      //根据受控源对上述矩阵做修正
      for(var p in itemlist){
        if(itemlist[p].id==4){//是电压控制电压源,受控源是控源的倍数，如果是接地的什么都不用做
          for (let j = 0; j < mheight; j++) {
            Rresult[itemlist[p].nodeend - 1][j] = 0
          }
          Rresult[itemlist[p].nodeend - 1][itemlist[p].nodeend - 1] = 1
          Rresult[itemlist[p].nodeend - 1][itemlist[p].nodestart - 1] = -1
          Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] -= itemlist[p].num
          Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1] += itemlist[p].num

          // for(let j=0;j<mheight;j++){
          //   if(j==itemlist[p].nodeend-1){
          //     Rresult[itemlist[p].nodeend - 1][j] = 1
          //   }else{
          //     if(j==itemlist[p].nodestart-1){
          //       Rresult[itemlist[p].nodeend - 1][j] = -1
          //     }else{
          //       if(j==itemlist[p].knodeend-1){//如果是控制支路的结束结点，应为负值
          //         Rresult[itemlist[p].nodeend-1][j] = -itemlist[p].num
          //       }else{
          //         if (j == itemlist[p].knodestart - 1) {//如果是控制支路的开始结点，应为正值
          //           Rresult[itemlist[p].nodeend-1][j] = +itemlist[p].num
          //         }else{
          //           Rresult[itemlist[p].nodeend-1][j]=0
          //         }
          //       }
          //     }
          //   }
          // }
          
        }
        if(itemlist[p].id==5){//是电压控制电流源
          Rresult[itemlist[p].nodeend-1][itemlist[p].knodeend-1] += itemlist[p].num
          Rresult[itemlist[p].nodeend-1][itemlist[p].knodestart-1] -=itemlist[p].num
          Rresult[itemlist[p].nodestart - 1][itemlist[p].knodeend - 1] -= itemlist[p].num
          Rresult[itemlist[p].nodestart - 1][itemlist[p].knodestart - 1] += itemlist[p].num
        }
        if(itemlist[p].id==6){//是电流控制电压源，起始在参数上做个修正就行了通过将所给系数除以控制支路电阻即可
          for(let j=0;j<mheight;j++){
            Rresult[itemlist[p].nodeend - 1][j] = 0
          }
          Rresult[itemlist[p].nodeend - 1][itemlist[p].nodeend - 1] = 1
          Rresult[itemlist[p].nodeend - 1][itemlist[p].nodestart - 1] = -1
          Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] += itemlist[p].num2 / parseInt(itemlist[p].num1)
          Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1] -= itemlist[p].num2 / parseInt(itemlist[p].num1)
        }
        if(itemlist[p].id==7){//是电流控制电流源，同理
         if(itemlist[p].knodeend!=0){
            if (itemlist[p].nodeend != 0) { 
             Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] += itemlist[p].num2 / itemlist[p].num1
            }
            if(itemlist[p].nodestart!=0){
              Rresult[itemlist[p].nodestart - 1][itemlist[p].knodeend - 1] += itemlist[p].num2 / itemlist[p].num1
            }
         }
          if(itemlist[p].knodestart!=0){
            if (itemlist[p].nodeend != 0) {
              Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1] -= itemlist[p].num2 / itemlist[p].num1
            }
            if (itemlist[p].nodestart != 0) {
              Rresult[itemlist[p].nodestart - 1][itemlist[p].knodestart - 1] -= itemlist[p].num2 / itemlist[p].num1
            }
          }
          
        }
      }
      console.log("Rresult=",Rresult)
      console.log("Iresult=",Iresult)
    var temp = that.inverse(Rresult)
    console.log("inverse",temp)
    var result = that.multiply(temp, Iresult)
    for(let i=0;i<mheight;i++){
      result[i][0] = result[i][0].toFixed(2)
    }
    that.setData({
      result:result,
      currentid: 3
    })
  },
  railnum:function(e){
    var that = this
    var length=that.data.nodenum
    var k=new Array();
    k[0] = e.detail.value.one_0
    k[1] = e.detail.value.one_1
    k[2] = e.detail.value.one_2//再想办法
    that.setData({
      currentid:3,
      railnum:k
    })
  },
  add:function(){//增加元件
    var that = this
    that.setData({
      showadd:true
    })
  },
  add2:function(){
    var that = this
    that.setData({
      showaddk:true
    })
  },
  disshowadd:function(e){//提交增加元件的表单
    var that = this
    if(e.detail.value.id==3){
      let a = { id: '', num1: '',num2:'', nodestart: '', nodeend: '' }
      a.id = e.detail.value.id
      a.num1 = parseInt(e.detail.value.num1)
      a.num2 = parseInt(e.detail.value.num2)
      a.nodestart = e.detail.value.nodestart
      a.nodeend = e.detail.value.nodeend
      var temp = that.data.itemlist
      temp.push(a)
      that.setData({
        itemlist: temp
      })
      that.setData({
        showadd: false,
      })
    }else{
      if(e.detail.value.id>3){//受控源
        switch(parseInt(e.detail.value.id)){
          case 4:{//电压控制电压源
            let a = { id: '', num: '', nodestart: '', nodeend: '',knodestart:'',knodeend:''}
            a.id = e.detail.value.id
            a.num = parseFloat(e.detail.value.num)//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend=e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            console.log("a=",a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showadd: false,
            })
            break;
          }
          case 5:{//电压控制电流源
            let a = { id: '', num: '', nodestart: '', nodeend: '', knodestart: '', knodeend: '' }
            a.id = e.detail.value.id
            a.num = parseFloat(e.detail.value.num)//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend = e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showadd: false,
            })
            break;
          }
          case 6:{//电流控制电压源
            let a = { id: '', num1: '',num2:'', nodestart: '', nodeend: '', knodestart: '', knodeend: '' }
            a.id = e.detail.value.id
            a.num1 = parseInt(e.detail.value.num1)//电阻
            a.num2 = parseFloat(e.detail.value.num2)//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend = e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showadd: false,
            })
          break;
          }
          case 7:{//电流控制电流源
            let a = { id: '', num1: '', num2: '', nodestart: '', nodeend: '', knodestart: '', knodeend: '' }
            a.id = e.detail.value.id
            a.num1 = parseInt(e.detail.value.num1)//电阻
            a.num2 =  parseFloat(e.detail.value.num2)//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend = e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showadd: false,
            })
            break;
          }
        }
        that.setData({
          showaddk:false
        })
      }else{
        let a = { id: '', num: '', nodestart: '', nodeend: '' }
        a.id = e.detail.value.id
        a.num = parseInt(e.detail.value.num)
        a.nodestart = e.detail.value.nodestart
        a.nodeend = e.detail.value.nodeend
        var temp = that.data.itemlist
        temp.push(a)
        that.setData({
          itemlist: temp
        })
        that.setData({
          showadd: false,
          iscom: false,
          inputid: 0,
        })
      }
    }
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
          // console.log("i=", i, "j=", j, "m=", m, "[i][m]=", matrix[i][m], "[m][j]=", matrix2[m][j], "rt=", matrix[i][m] * matrix2[m][j])
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
    var p=that.inverse(that.data.ab)
    var q=that.matrixcal(that.data.ab)
    console.log(q)
    console.log(p)
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        })
      },
    })
  },
  everycalculate: function (itemlist,nodenum) {//通过传入一个itemlist和结点数来计算,返回结点电压法的计算结果即每个结点的电压
    var that = this
    console.log("thelistsi", itemlist)
    var height = nodenum
    var mheight = height
    var Rresult = new Array();
    var Iresult = new Array();
    var badnodeslist = new Array()//存储一个带三个key值的json，start结点，end结点，两结点之间的值 
    for (let i = 0; i <= height; i++) {//查找bad_nodes,即结点之间是一个电压源
      for (let j = height; j > i; j--) {//i>j节省运算成本
        var badnodes = { nodestart: '', nodeend: '', nodevalue: '' }
        for (var p in itemlist) {
          if (itemlist[p].id == 1) {
            if (itemlist[p].nodestart == i && itemlist[p].nodeend == j) {
              badnodes.nodestart = i
              badnodes.nodeend = j
              badnodes.nodevalue = itemlist[p].num
              badnodeslist.push(badnodes)
            }
          }
        }
      }
    }
    for (let k = 0; k < mheight; k++) {
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
            if (itemlist[p].id == 3) {//有伴电压源的电阻
              if (itemlist[p].nodestart == Uid || itemlist[p].nodeend == Uid) {
                Rsum = Rsum + 1 / parseInt(itemlist[p].num1)
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
      var id = i + 1
      var Isum = 0;
      var Uid = i + 1
      for (var p in itemlist) {
        if (itemlist[p].id == 2) {
          if (itemlist[p].nodestart == Uid) {//流出为负
            Isum = Isum - parseInt(itemlist[p].num)
          }
          if (itemlist[p].nodeend == Uid) {//流入为正
            Isum = Isum + parseInt(itemlist[p].num)
          }
        }
        if (itemlist[p].id == 3) {
          if (itemlist[p].nodestart == Uid) {
            Isum = Isum - parseInt(itemlist[p].num2) / parseInt(itemlist[p].num1)
          }
          if (itemlist[p].nodestart == Uid) {
            Isum = Isum + parseInt(itemlist[p].num2) / parseInt(itemlist[p].num1)
          }
        }
      }
      Iresult[i][0] = Isum
    }
    //根据无伴电压源对上述矩阵做修正
    if (badnodeslist != '') {
      for (var p in badnodeslist) {
        if (badnodeslist[p].nodestart == 0) {
          for (let j = 0; j < mheight; j++) {
            if (j + 1 == badnodeslist[p].nodeend) {
              Rresult[badnodeslist[p].nodeend - 1][j] = 1
              Iresult[badnodeslist[p].nodeend - 1][0] = badnodeslist[p].nodevalue
            } else {
              Rresult[badnodeslist[p].nodeend - 1][j] = 0
            }
          }
        } else {
          if (badnodeslist[p].nodeend == 0) {
            for (let j = 0; j < mheight; j++) {
              if (j + 1 == badnodeslist[p].nodeend) {
                Rresult[badnodeslist[p].nodeend - 1][j] = 1
                Iresult[badnodeslist[p].nodeend - 1][0] = -badnodeslist[p].nodevalue
              } else {
                Rresult[badnodeslist[p].nodeend - 1][j] = 0
              }
            }
          } else {
            for (let j = 0; j < mheight; j++) {//改变电压源末端结点的方程，
              if (j + 1 == badnodeslist[p].nodeend) {
                Rresult[badnodeslist[p].nodeend - 1][j] = 1
                Iresult[badnodeslist[p].nodeend - 1][0] = badnodeslist[p].nodevalue
              } else {
                if (j + 1 == badnodeslist[p].nodestart) {
                  Rresult[badnodeslist[p].nodeend - 1][j] = -1
                }
                else {
                  Rresult[badnodeslist[p].nodeend - 1][j] = 0
                }
              }
            }
          }
        }
      }
    }
    var k= that.matrixcal(Rresult)
    var temp = that.inverse(Rresult)
    var result = that.multiply(temp, Iresult)
    for (let i = 0; i < mheight; i++) {
      result[i][0] = result[i][0].toFixed(2)
    }
    return result;
  },
})
