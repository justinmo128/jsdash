function checkCollision() {
    player.touchingBlock = false;
    player.touchingOrb = [];
    // Object collision
    for (let i = 0; i < gameObjs.length; i++) {
        // Blue Player + Blue Obj (Running into blocks)
        if (gameObjs[i].hasHitbox && collides(player.bluehbx, player.bluehby, player.bluehbw, player.bluehbh, gameObjs[i].hbx, gameObjs[i].hby, gameObjs[i].hbw, gameObjs[i].hbh) && gameObjs[i].hbType == "blue") {
            playerDeath();
        } else if (gameObjs[i].hasHitbox && collides(player.x, player.y, player.w, player.h, gameObjs[i].hbx, gameObjs[i].hby, gameObjs[i].hbw, gameObjs[i].hbh)) {
            // Red Player + Green Obj (Portals, Orbs, Pads)
            if (gameObjs[i].isPortal && !gameObjs[i].activated) {
                if (player.mode !== gameObjs[i].portalType) {
                    player.yVel = 0;
                }
                if (gameObjs[i].portalType == "ship" || gameObjs[i].portalType == "cube") {
                    switchGamemode(gameObjs[i]);
                }
            } else if (gameObjs[i].isPad && !gameObjs[i].activated) {
                if (gameObjs[i].padType == "yellow") {
                    if (player.mode == "cube") {
                        player.yVel = 862.0614;
                    } else if (player.mode == "ship") {
                        player.yVel = 432;
                    }
                    return;
                }
            } else if (gameObjs[i].isOrb && !gameObjs[i].activated) {
                player.touchingOrb.push(i)
            }
            // Red Player + Blue Obj (Landing on blocks)
            else if (gameObjs[i].hbType == "blue") {
                if (player.y <= gameObjs[i].y + gameObjs[i].h && player.y + 10 >= gameObjs[i].y + gameObjs[i].h && player.yVel <= 0) {
                    player.y = gameObjs[i].y + gameObjs[i].hbh;
                    player.bluehby = player.y + 11;
                    player.grounded = true;
                    player.touchingBlock = true;
                } else if (player.y + player.h - 10 < gameObjs[i].y && player.y + player.h > gameObjs[i].y && player.mode == "ship" && player.yVel >= 0) {
                    player.roofed = true;
                    player.y = gameObjs[i].y - player.h;
                    player.bluehby = player.y + 11;
                    player.touchingBlock = true;
                }
            // Red Player + Red Obj (Spikes)
            } else if (gameObjs[i].hbType == "red") {
                playerDeath();
            }
        }
    }
    if (player.grounded || player.roofed) {
        player.yVel = 0;
    }
}

function switchGamemode(obj) {
    player.mode = obj.portalType;
    if (player.mode == "ship") {
        if (obj.y - 120 < 0 && !obj.activated) {
            ease(newFloor, [0, newFloor.y * -1], 200, "linear")
            ease(roof, [0, roof.y * -1 + 390], 200, "linear")
            ease(camera, [0, 45 - camera.y], 200, "linear")
            newFloor.hby = 0;
        } else if (!obj.activated) {
            newFloor.hby = roundToNearest(obj.y - 120, 30);
            ease(newFloor, [0, newFloor.hby - newFloor.y], 200, "linear")
            ease(roof, [0, newFloor.hby + 390 - roof.y], 200, "linear")
            ease(camera, [0, newFloor.hby + 45 - camera.y], 200, "linear")
        }
        roof.hby = newFloor.hby + 390;
        newFloor.canCollide = true;
        roof.canCollide = true;
    } else if (player.mode == "cube") {
        cubeTransition = true;
        ease(camera, [0, 0 - camera.y], 200, "linear", () => {cubeTransition = false;})
        newFloor.canCollide = false;
        roof.canCollide = false;
    }
    player.angle = 0;
    obj.activated = true;
}

function checkFloorRoofCollision() {
    // Ground, roof collision
    if (player.y <= newFloor.hby && newFloor.canCollide) {
        player.y = newFloor.y;
        player.bluehby = player.y + 11;
        player.grounded = true;
        return;
    } else if (player.y <= 0) {
        player.y = 0;
        player.bluehby = player.y + 11;
        player.grounded = true;
        return;
    } else if (player.y + player.h >= roof.hby - roof.h && roof.canCollide) {
        player.roofed = true;
        player.y = roof.y - roof.h - player.h;
        return;
    } else if (!player.touchingBlock) {
        player.grounded = false;
        player.roofed = false;
    }
    if (player.roofed && !keyHeld) {
        player.roofed = false;
    }
}

function collides(Ax, Ay, Aw, Ah, Bx, By, Bw, Bh) {
    if (Ax <= Bx + Bw &&
        Ax + Aw >= Bx &&
        Ay <= By + Bh &&
        Ay + Ah >= By) {
            return true;
    }
    return false;
}

function playerDeath() {
    player.dead = true;
    setTimeout(initialize, 300)
}