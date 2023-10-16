import * as THREE from './module/three.module.js';
import Stats from './module/stats.module.js';
import WebGL from './module/WebGL.js';
import EditorGUI from "./EditorGUI.js";
import OrbitControls from "./module/OrbitControls.js";

if ( WebGL.isWebGLAvailable() == false ) 
{
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
    window.stop(); 
}

let stats, editorGUI;
let camera, scene, renderer;
let cube, mouse, raycaster;
let cameraControl;

Init()
Animate()

function Init()
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let editorState = false;
    if(urlParams.has('editor')){
        editorState = (urlParams.get('editor') == 'true')
    }

    //environment
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );

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

    //Add shadow plane
    let MeshMaterial = {
        color: 0xaaaaaa,
        //depthWrite: false,
        side: THREE.DoubleSide,
    }
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(),
        new THREE.MeshPhongMaterial( MeshMaterial ),
    );
    plane.position.y = -2;
    plane.rotation.x = Math.PI * 0.5;
    plane.scale.setScalar( 100 );
    plane.receiveShadow = true;
    scene.add( plane );

    //Create Object
    MeshMaterial = {
        color: 0xffaaff,
        reflectivity: 0.5,
        wireframe: false,
    }    
    //const geometry = new THREE.SphereGeometry( 1, 64, 64 );
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    cube = new THREE.Mesh( geometry,  new THREE.MeshPhongMaterial( MeshMaterial ) );
    cube.castShadow = true;
    scene.add( cube );

    //Camera controls
    cameraControl = new OrbitControls( camera, renderer.domElement );

    if( editorState ) {
        //Stats
        stats = new Stats();
        document.body.appendChild( stats.dom );

        //Editor
        editorGUI = new EditorGUI();
    }
    else {
        stats = null;
        editorGUI = null;
    }

    //Add Event Listeners
    document.addEventListener( 'mousemove', onMouseMove )
    window.addEventListener('resize', onWindowResize, false)

    onWindowResize()
    DrawSceneEditorUI()
}

function DrawSceneEditorUI() {
    if(editorGUI == null){
        console.log("Editor Disabled")
        return
    }
    
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
    
    if( stats != null )
        stats.update()
}

function Render() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    raycaster.setFromCamera( mouse, camera );
    cameraControl.update()
    renderer.render(scene, camera)
}
