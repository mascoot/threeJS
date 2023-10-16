import { Pane } from './module/tweakpane-4.0.1.js';

class EditorGUI {
    constructor(scene) {
      this.gui = new Pane();
      this.guifld = new Map();
      this.sceneSize = 10;
    }

    GetObjectType( object ) {
        if ( object.isScene ) return 'Scene';
        if ( object.isCamera ) return 'Camera';
        if ( object.isLight ) return 'Light';
        if ( object.isMesh ) return 'Mesh';
        if ( object.isLine ) return 'Line';
        if ( object.isPoints ) return 'Points';
        return 'Object3D';
    }

    addFolder( foldername ) {
        if (!this.guifld.has(foldername)) {
            this.guifld.set(foldername , this.gui.addFolder({title:foldername}));
        }
        return this.guifld.get(foldername);
    }

    add( object, varname, params ){
        return this.gui.addBinding(object, varname, params)
    }

    addObject( object ){
        console.log(object)
        var gType = this.GetObjectType(object)
        var objName = (gType == "Mesh") ? object.geometry.type : object.type

        var objRoot = this.gui;
        if(gType != "Scene"){
            objRoot = this._addFolder(object.uuid, objName)
            var transform = objRoot.addFolder({title:"Transform"})
            transform.addBinding(object, "position", {step: 0.1})
        }
        if(object.geometry){
            var mesh = objRoot.addFolder({title:"Geometry"})
            mesh.addBinding(object.geometry, "type", {readonly: true})
        }

        if(object.material){
            var mat = objRoot.addFolder({title:"Material"})
            mat.addBinding(object.material, "type", {readonly: true})
            this._bindColor(mat, object.material.color)
        }

        if(object.geometry) {
            objRoot.addBinding(object, "visible")
            objRoot.addBinding(object, "receiveShadow")
        }
        else {
            var objColor = gType == "Scene" ? object.background : object.color
            this._bindColor(objRoot, objColor)
        }

        if(gType != "Scene"){
            objRoot.addBinding(object, "castShadow")
        }
    }

    
    _addFolder( uuid, foldername ) {
        if (!this.guifld.has(uuid)) {
            this.guifld.set(uuid , this.gui.addFolder({title:foldername}));
        }
        return this.guifld.get(uuid);
    }

    _bindColor(pane, color) {
        const PARAMS = {
            color: {r:color.r, g:color.g, b:color.b}
        }
        pane.addBinding(PARAMS, "color", {color: {type: 'float'}})
        pane.on('change', (ev) => {
            if(ev.value.r && ev.value.g && ev.value.b){
                color.r = ev.value.r
                color.g = ev.value.g
                color.b = ev.value.b
            }
          })
    }
}

export default EditorGUI;

