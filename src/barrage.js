// 创建Barrage类，用来实例化每一个弹幕元素
let config = {
    pathway: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
}
class Barrage {
    constructor(obj, ctx) {
        this.value = obj.value;
        this.time = obj.time;
        this.obj = obj;
        this.context = ctx;
    }
    init() {
        this.color = this.obj.color || this.context.color;
        this.runTime = this.obj.runTime || this.context.runTime;
        this.opacity = this.obj.opacity || this.context.opacity;
        this.fontSize = this.obj.fontSize || this.context.fontSize;

        // 为了计算每个弹幕的宽度，我们必须创建一个元素，然后计算文字的宽度
        let p = document.createElement('p');
        p.style.position = "absolute";
        p.style.font = this.fontSize + 'px';
        p.innerHTML = this.value;
        document.body.appendChild(p);
        // 设置弹幕的宽度
        this.width = p.clientWidth;
        document.body.removeChild(p);
        this.speed = (this.context.canvas.width + this.width) / this.runTime;

        this.x = this.context.canvas.width;
        let aa = config.pathway.shift();
        config.pathway.push(aa);
        this.y = aa * this.fontSize;

        // 考虑到弹幕会超出顶部和底部的距离，所以需要处理一下超出范围
        // canvas是按照字号基线来展示字体的
        // 如果小于这个字号大小
        if (this.y < this.fontSize) {
            this.y = this.fontSize;
        } else if (this.y > this.context.canvas.height - this.fontSize) {
            this.y = this.context.canvas.height - this.fontSize;
        }
    }
    render() {
        this.context.ctx.font = `${this.fontSize}px Arial`;
        this.context.ctx.fillStyle = this.color;
        this.context.ctx.fillText(this.value, this.x, this.y);
    }
}

// 创建CanvasBarrage类，主要用做canvas来渲染整个弹幕
class CanvasBarrage {
    constructor(canvas, video, opts = {}) {
        // 如果canvas和video都没传，那就直接return掉
        if (!canvas || !video) return;
        // 直接挂到this上
        this.video = video;
        this.canvas = canvas;
        // 给canvas画布设置和video宽高一致
        this.canvas.width = video.width;
        this.canvas.height = video.height;
        // 获取画布
        this.ctx = canvas.getContext('2d');

        // 设置默认参数
        let defOpts = {
            color: '#e91e63',
            // 弹幕运行的时间
            runTime: 500,
            opacity: 0.5,
            fontSize: 20,
            data: []
        };
        // 合并对象并全都挂到this实例上
        Object.assign(this, defOpts, opts);

        // 添加个属性，用来判断播放状态，默认是true暂停
        this.isPaused = true;
        // 得到所有的弹幕消息
        this.barrages = this.data.map(item => new Barrage(item, this));
        // 渲染
        this.render();

        console.log(this);
    }

    // 开始循环渲染
    render() {
        // 每次渲染先清空画布，防止后面绘制和前面的重叠
        this.clear();
        // 渲染弹幕
        this.renderBarrage();
        // 如果没有暂停的话就继续渲染
        if (this.isPaused === false) {
            // 通过raf渲染动画，递归进行渲染
            requestAnimationFrame(this.render.bind(this));
        }
    }

    // 渲染单个 弹幕
    renderBarrage() {
        let time = this.video.currentTime;
        this.barrages.forEach(barrage => {
            if (!barrage.flag && time >= barrage.time) {
                if (!barrage.isInit) {
                    barrage.init();
                    barrage.isInit = true;
                }
                barrage.x -= barrage.speed;
                barrage.render();
                if (barrage.x < -barrage.width) {
                    barrage.flag = true;
                }
            }
        });
    }

    // 清空 弹幕
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 增加弹幕
    pushData(obj = {value: '默认数据', time: 1 }) {
        if( obj instanceof Array && obj.length > 0 ) {
            obj.forEach(item => {
                this.barrages.push(new Barrage(item, this));
            })
        } else {
            Object.assign(obj, {
                value: '默认数据', 
                time: 1 
            })
            this.barrages.push(new Barrage(obj, this));
        }
    }

    // 开始播放
    play() {
        this.isPaused = false;
        this.render();
    }

    // 暂停播放
    pause() {
        this.isPaused = true;
    }

    // 重新播放
    replay() {
        this.clear();
        let time = this.video.currentTime;
        this.barrages.forEach(barrage => {
            barrage.flag = false;
            if (time <= barrage.time) {
                barrage.isInit = false;
            } else {
                barrage.flag = true;
            }
        });
    }
}