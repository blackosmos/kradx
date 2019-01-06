var width = window.innerWidth;
var height = window.innerHeight;
// 创建一个场景
var scene = new THREE.Scene();
// 场景雾化效果
scene.fog = new THREE.Fog( 0x000000, 40, 100 );
// scene.fog = new THREE.FogExp2( 0x000000, 0.01 );

// 创建一个具有透视效果的摄像机
var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 800);

camera.position.x = 10;
camera.position.y = 15;
camera.position.z = 45;
camera.lookAt(scene.position);

// 创建一个 WebGL 渲染器，Three.js 还提供 <canvas>, <svg>, CSS3D 渲染器
var renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setClearColor(0x000000);
renderer.setSize(width,height);

// 将渲染器的输出（此处是 canvas 元素）插入到 body
document.body.appendChild(renderer.domElement);

// 摄像机控制
var orbitControls = new THREE.OrbitControls(camera);
orbitControls.autoRotate = true;

// 创建canvas材质
var material = new THREE.PointsMaterial({
    size: 1,
    color: 0xffffff,
    // 使用 opacity 的前提是开启 transparent
    opacity: 1,
    // 设置元素与背景的融合模式
    blending: THREE.AdditiveBlending,
    // 指定粒子的纹理
    map: generateSprite(),
    // 用于去除纹理的黑色背景
    depthTest: false
})

// 创建几何空间
var geometry = new THREE.Geometry();
// 空间半径
var range = 100;
// 黑洞半径
var holeRange = 8;
// 黑洞深度
var holeDepth = 20;
// 圈层间距
var spacing = 0.5;
// 单圈点密度
var dis = 2;

// 绘制中心黑洞
// sc 控制黑洞聚集度
var sc = 0.1;
for (var r = 0.1; r < holeRange; r += spacing*sc) {
    // x,z轴使用角度(m)公式画圆，扩大半径r形成圆盘
    for (var m = 0; m < Math.PI*2; m += Math.PI/r/dis*(sc+0.1)) {
        var particle = new THREE.Vector3(
            r*Math.cos(m),
            - Math.pow(holeRange - r, 2)/holeDepth*holeRange,
            r*Math.sin(m));
        geometry.vertices.push(particle);
    }
    sc = Math.pow(r, 2) / Math.pow(holeRange, 2);
}

// 绘制黑洞外围
for (var r = holeRange; r <= range; r += spacing) {
    // x,z轴使用角度(m)公式画圆，扩大半径r形成圆盘
    for (var m = 0; m < Math.PI*2; m += Math.PI/r/dis) {
        var particle = new THREE.Vector3(
            r*Math.cos(m),
            0,
            r*Math.sin(m));
        particle.opacity
        geometry.vertices.push(particle);
    }
}

var points = new THREE.Points(geometry, material);
scene.add(points);

// 波浪运动速度
var speed = 0.02;
// 振幅抑制
var amp = 0.3;

var step = 0;
var ry;
function render(){
    renderer.render(scene, camera);

    scene.children.forEach(function (child) {
        if (child instanceof THREE.Points) {
            var vertices = child.geometry.vertices;
            child.geometry.verticesNeedUpdate = true;
            vertices.forEach(function (v) {
                ry = lengthOfLine(0,0,v.x,v.z);
                // 渐弱波浪: y轴 Math.sin(ry)*(range-ry)/range/amp 
                // v.y = Math.sin(Math.abs(ry-step))*(range-ry)/range/amp;
                // 渐强波浪: y轴 Math.sin(ry)*ry/range/amp 
                if (ry > holeRange) {
                    v.y = Math.sin(Math.abs(ry - step))*ry/range/amp;
                } else {
                    v.y = - Math.pow(holeRange - ry, 2)/holeDepth*holeRange + Math.sin(Math.abs(ry-step))*ry/range/amp
                }
                
            })
        }
    })

    step += speed;
    requestAnimationFrame(render);
}

 // 生成纹理
 function generateSprite() {
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;

    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}



render();

// 循环动画
// function animate(){
//     requestAnimationFrame(animate);

//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;

//     renderer.render(scene, camera);
// }
// animate();

// 任意两个二维向量之间的距离
function lengthOfLine(x1,y1,x2,y2){
    let ox = Math.pow((x2-x1),2);
    let oy = Math.pow((y2-y1),2);
    return Math.sqrt(ox+oy);
}