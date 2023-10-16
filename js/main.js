import * as THREE from './three.module.js';
import Stats from './module/stats.module.js';
import WebGL from './module/WebGL.js';
import EditorGUI from "./EditorGUI.js";

if ( WebGL.isWebGLAvailable() == false ) 
{
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
    window.stop(); 
}

let stats, editorGUI;
let camera, scene, renderer;
let cube, mouse, raycaster;

const MeshMaterial = {
    color: 0xffaaff,
    reflectivity: 0.5,
    wireframe: false,
}

Init()
Animate()

function Init()
{
    //environment
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xfce4ec );

    //lights
    const ambient = new THREE.HemisphereLight( 0xffffff, 0xbfd4d2, 3 );
    scene.add( ambient );

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
    directionalLight.position.set( 1, 4, 3 ).multiplyScalar( 3 );
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.setScalar( 2048 );
    directionalLight.shadow.bias = - 1e-4;
    directionalLight.shadow.normalBias = 1e-4;
    scene.add( directionalLight );

    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild( renderer.domElement );

    //Init Mouse
    mouse = new THREE.Vector2( 1, 1 );
    raycaster = new THREE.Raycaster();

    //Stats
    stats = new Stats();
    document.body.appendChild( stats.dom );

    //Add shadow plane
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(),
        new THREE.ShadowMaterial( {
            color: 0xd81b60,
            transparent: true,
            opacity: 0.075,
            side: THREE.DoubleSide,
        } ),
    );
    plane.position.y = -2;
    //plane.rotation.x = - Math.PI / 2;
    plane.scale.setScalar( 10 );
    plane.receiveShadow = true;
    scene.add( plane );

    //Create Object
    const geometry = new THREE.SphereGeometry( 1, 64, 64 );
    var material = new THREE.MeshPhongMaterial( MeshMaterial );
    cube = new THREE.Mesh( geometry, material );
    cube.castShadow = true;
    scene.add( cube );

    editorGUI = new EditorGUI(scene);
    //Add Event Listeners
    document.addEventListener( 'mousemove', onMouseMove )
    window.addEventListener('resize', onWindowResize, false)

    onWindowResize()
    DrawSceneEditorUI()
}

function DrawSceneEditorUI() {

    editorGUI.add( document, 'title', {readonly: true});
    editorGUI.addObject(scene)

    for( var idx in scene.children ){
        editorGUI.addObject(scene.children[idx])
    }
}

function onMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function Animate() {
    requestAnimationFrame( Animate );
    Render()
    stats.update()
}

function Render() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    raycaster.setFromCamera( mouse, camera );
    //const intersection = raycaster.intersectObject( cube );
    //if ( intersection.length > 0 ) {
    //    intersection[0].object.material.color.set(1, 0, 0.5);
    //}

    renderer.render(scene, camera)
}


