// 创建Barrage类，用来实例化每一个弹幕元素
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