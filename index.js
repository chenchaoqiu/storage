var new_element=document.createElement("script");
new_element.setAttribute("type","text/javascript");
new_element.setAttribute("src","calc.js");
document.head.appendChild(new_element);

/*
* 所有功能如下：
* 连接数据库，
* 创建表,
* 修改表名，
* 连接表，
* 筛选条件，
* 新增数据
* 修改表数据
* 查询数据
* 删除数据，删除表
* 退出数据库
* ***********************************************************************************************************
* 操作如下：
* 连接数据库：signIn();
* 退出数据库：signOut()；
* 操作数据库的操作函数：operation(value);
* ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
* value ==> {status:'操作状态',from:'表名',$if:'条件',name:'new 表名',value:'数据',time:'存在时间'}
* ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
* status ==> ADDFROM（创建表），UPDATAFROMNAME（修改表名），ADD（新增数据），UPDATA（修改数据），QUERY（查询数据），DELETE（删除数据）
* ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
* value ==> ADD新增数据的格式：[{第一条数据},{第二条数据},…]；UPDATA修改数据的格式：[['key','new value'],['key','new value'],…]
* $if ==> 格式：[['第一类',[包含多个]],['第二类',[包含多个]],…]；比如：[['id',[2,3,5]],['name',['车','设']]]
* time ==> Number
* name ==> String
* from ==> String
* ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
* 各个函数所需要参数如下：
* ADDFROM ==> {status,from,time(非必须，默认为12小时)}
* UPDATAFROMNAME ==> {status,from,name,time(非必须，默认为上次的时间)}
* ADD ==> {status,from,value}
* UPDATA ==> {status,from,$if(没有或为空这个的时候是全局修改),value}
* QUERY ==> {status,from,$if(没有或为空这个的时候是全局查询)}
* DELETE ==> {status,from,$if(没有这个的时候删除的是整个表)}
*/
var $webSql = {signIn:function(e) {
    setTimeout(function() {
      $webSql.signIn(e)
    },1)
  }};
window.onload = function () {
  $webSql = {
    webSql: function(e) {
      if (e !== 'in') { return; }
      return function(w) {
        const from = {
          publicFunction: function(e) {
            /* 公共逻辑处理部分*/
            const updataAttr = JSON.parse(getToken(w.from)[0])[0];
            let attr = updataAttr;
            let saveAttr = [];
            if (w.$if) {
              for (let i = 0; i < w.$if.length; i++) {
                for (let j = 0; j < attr.length; j++) {
                  if (w.$if[i][1].indexOf(attr[j][w.$if[i][0]]) >= 0 || !w.$if[i][1].length) {
                    saveAttr.push(attr[j])
                  }
                }
                if (w.$if.length > i) {
                  attr = saveAttr;
                  saveAttr = [];
                }
              }
            }
            if (e === 'up') {
              for (let k = 0; k < attr.length; k++) {
                for (let j = 0; j < w.value.length; j++) {
                  attr[k][w.value[j][0]] = w.value[j][1];
                }
              }
            }
            if (e === 'del') {
              for (let k = 0; k < attr.length; k++) {
                attr[k].status = true;
              }
            }
            return { updataAttr: updataAttr, attr: attr }
          },
          QUERY: function() {
            /* 查询*/
            if(getToken(w.from).length === 0){ return $webSql.errorFn({ type: 'QUERY', msg: `没有找到“${w.from}”表！`, status: 404 }); }
            const attr = this.publicFunction().attr;
            function compare(val1, val2) {
              return val1.id - val2.id;
            }
            attr.sort(compare);
            return { data: attr, msg: '查询成功', status: 200 };
          },
          ADD: function() {
            /* 新增*/
            if (w.value.length === 0 || !w.value) { return $webSql.errorFn({ type: 'ADD', msg: '新增的数据为空！', status: 505 }); }
            if (getToken(w.from) === undefined) { return $webSql.errorFn({ type: 'ADD', msg: `没有找到“${w.from}”表！`, status: 404 }); }
            let attr = JSON.parse(getToken(w.from)[0]);
            for (let i = 0; i < w.value.length; i++) {
              w.value[i]._FROMID = ((attr[1] ? attr[1] : 0) + i + 1);
            }
            attr = attr[0].concat(w.value);
            setToken(w.from, [attr, attr[attr.length - 1]._FROMID], getToken(w.from)[1], true);
            return { msg: '新增数据成功！', status: 200 };
          },
          UPDATA: function() {
            /* 修改*/
            if (getToken(w.from).length === 0) { return $webSql.errorFn({ type: 'UPADTA', msg: `没有找到“${w.from}”表！`, status: 404 }); }
            setToken(w.from, [this.publicFunction('up').updataAttr, JSON.parse(getToken(w.from)[0])[1]], getToken(w.from)[1], true);
            return { msg: '修改数据成功！', status: 200 };
          },
          DELETE: function() {
            if (getToken(w.from).length === 0) { return $webSql.errorFn({ type: 'DELETE', msg: `没有找到“${w.from}”表！`, status: 404 }); }
            if (!w.$if) {
              /* 删除表*/
              removeToken(w.from);
              return { msg: '删除表成功！', status: 200 };
            }
            /* 删除数据*/
            Array.prototype.indexOf = function(val) {
              for (var i = 0; i < this.length; i++) {
                if (this[i] == val) return i;
              }
              return -1;
            };
            Array.prototype.remove = function(val) {
              var index = this.indexOf(val);
              if (index > -1) {
                this.splice(index, 1);
              }
            };
            const publicAttr = this.publicFunction('del');
            for (let i = 0; i < publicAttr.attr.length; i++) {
              publicAttr.updataAttr.remove(publicAttr.attr[i])
            }
            setToken(w.from, [publicAttr.updataAttr, JSON.parse(getToken(w.from)[0])[1]], getToken(w.from)[1], true);
            return { msg: '删除' + publicAttr.attr.length + '条数据成功！', status: 200 };
          },
          ADDFROM: function() {
            /* 创建表*/
            setToken(w.from, [[], 0], w.time)
            return { msg: '创建表成功！', status: 200 };
          },
          UPDATAFROMNAME: function() {
            /* 修改表名*/
            if (getToken(w.from).length === 0) {
              const attr = getToken(w.from);
              removeToken(w.from);
              setToken(w.name, JSON.parse(attr[0]), w.time || attr[1], !w.time);
              return { msg: '修改表名成功！', status: 200 };
            }
            return $webSql.errorFn({ type: 'UPDATAFROMNAME', msg: `没有找到“${w.from}”表！`, status: 404 });
          }
        };
        if (w) {
          return from[w.status]();
        }
      };
    },
    fromValue: 999,
    operation : null, // 闪存
    error: [], // 储存错误信息
    errorFn: function (e){ // 错误信息处理
        this.error.push(e)
    },
    signIn : function (e) {
      if(this.operation){return e({msg:'连接数据库失败，因为有数据库没有关闭，请求给予上一个数据库关闭指令！',status: 500});}
      this.operation = this.webSql('in');
      return e(this,{msg:'连接数据库成功！',status: 200});
    }, // 连接数据库
    signOut : function () {
      this.operation = null;
      return {msg:'退出数据库成功！',status: 200};
    }
  };
};
