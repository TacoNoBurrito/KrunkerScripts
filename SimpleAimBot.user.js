// ==UserScript==
// @name         SimpleAimBot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A Script To Give AimBot On Krunker.IO
// @author       Taco
// @include      /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?(server|party)=.+)$/
// @grant        none
// @require      https://unpkg.com/three@latest/build/three.min.js
// ==/UserScript==

// A Simple Tampermonkey Script For Krunker.IO AimBot Taking Advantage Of Three.JS

console.log("Join My Discord: https://discord.gg/vSExwxrkRk");

(function() {
    "use strict";

    // Define Our Objects We Will Be Using To Turn The Player
    const vector = new THREE.Vector3();
    // Will Act As a Fake Player So That Us(self) Can Copy It
    const object = new THREE.Object3D();
    // Change The Local Rotation Order To YXZ
    object.rotation.order = "YXZ";

    // The World and The Stuff In It Basically
    let scene;

    // Intercept The Scene's Fundamentals
    WeakMap.prototype.set = new Proxy(WeakMap.prototype.set, {
        apply(_, __, other) {
            // The Scene Has a Type Of "Scene" and a Name Of "Main"
            if (other[0].type === "Scene" && other[0].name === "Main") {
                scene = other[0];
            }
            return Reflect.apply(...arguments);
        }
    });

    function bot() {
        window.requestAnimationFrame(bot);
        if (!scene) return;
        const players = [];
        let self;
        // Get All Of The Children In The Scene
        const children = scene.children;
        for (let i = 0; i < children.length; i++) {
            const sc = children[i];
            // All Players Are The Type Of Object3D
            if (sc.type === "Object3D") {
                try {
                    // We Will Be The Perspective Obviously
                    if (sc.children[0].children[0].type === "PerspectiveCamera") {
                        self = sc;
                        continue;
                    }
                    // Anyone Else Gets Put Into A List Of Possible Enemies
                    if (self && self === sc) continue;
                    players.push(sc);
                } catch (ignore) {}
            }
        }
        // If Theres No One We Return and Try Again
        if (players.length < 2) return;
        let target;
        let dist = Infinity;
        // Loop Through The Possible Enemies
        for (let i = 0; i < players.length; i++) {
            const t = players[i];
            // If We Try To Shoot Ourselves, Then This Code Gets Real Useless
            if (t.position.x === self.position.x && t.position.z === self.position.z) continue;
            // Check Our Distance To The Enemy
            const distance = self.position.distanceTo(t.position);
            // If The Current Minimum Distance Is Larger Than This, Its Closer. So We Change The Target
            if (dist > distance) {
                dist = distance;
                target = t;
            }
            // We Might Have Not Found a Target By Now. Return and Try Again
            if (!target) return;
            // Init Vector
            vector.setScalar(0);
            // Change The Vector From Its Local Space -> World Space (set at position of target)
            target.children[0].children[0].localToWorld(vector);
            // Copy The Players Position For The Fake Player
            object.position.copy(self.position);
            // Look At Our Target
            object.lookAt(vector);
            // Force Ourself To Look At The Point.
            self.children[0].rotation.x = -object.rotation.x;
            self.rotation.y = object.rotation.y + Math.PI;
        }
    }

    bot();

})();
