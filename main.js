function t(t="Non-nullish value"){throw new TypeError(`${t} expected.`)}const e={a:1,b:0,c:0,d:1,tx:0,ty:0};function n({a:t,b:e,c:n,d:c,tx:s,ty:a}){return[t,n,e,c,s,a]}class c{static MIN_ZOOM=11;static MAX_ZOOM=20;#t;#e;view;constructor(n){this.#t=document.createElement("canvas");n.append(this.#t);this.#e=this.#t.getContext("2d")??t("Canvas context");this.view=e}render(){this.#e.save();this.#e.transform(...n(this.view));this.#e.fillRect(0,0,256,256);this.#e.restore()}}new c(document.getElementById("map")??t("Map wrapper"));
