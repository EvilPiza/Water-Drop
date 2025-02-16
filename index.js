//import { aStar } from "pathfinder";

export function wtr_chat (message) {
    ChatLib.chat(`&d[&bWTR&d] &e${message}`);
}
let turnSpeed = 0.05;
const TargetBlocks = ["Wool", "Prismarine"]

function getYawAndPitch(targetX, targetY, targetZ, playerX, playerY, playerZ) {
    wtr_chat("Calculating yaw and pitch...");

    targetX += 0.5;
    targetZ += 0.5;

    let eyeHeight = 1.62;
    let playerEyeY = playerY + eyeHeight;

    //let block = World.getBlockAt(targetX, targetY, targetZ);
    let blockAbove = World.getBlockAt(targetX, targetY + 1, targetZ);
    let blockBelow = World.getBlockAt(targetX, targetY - 1, targetZ);

    let blockNorth = World.getBlockAt(targetX, targetY, targetZ - 1);
    let blockSouth = World.getBlockAt(targetX, targetY, targetZ + 1);
    let blockEast = World.getBlockAt(targetX + 1, targetY, targetZ);
    let blockWest = World.getBlockAt(targetX - 1, targetY, targetZ);

    let aimY = targetY + 0.5;
    if (targetY > playerEyeY) {
        if (blockBelow.getType() === "air") {
            aimY = targetY - 0.05;
        } else {
            if (blockNorth.getType() === "air") targetZ -= 0.5; 
            else if (blockSouth.getType() === "air") targetZ += 0.5; 
            else if (blockEast.getType() === "air") targetX += 0.5; 
            else if (blockWest.getType() === "air") targetX -= 0.5; 
        }
    }
    else if (targetY < playerY) {
        if (blockAbove.getType() === "air") {
            aimY = targetY + 1.05;
        } else {
            if (blockNorth.getType() === "air") targetZ -= 0.5; 
            else if (blockSouth.getType() === "air") targetZ += 0.5; 
            else if (blockEast.getType() === "air") targetX += 0.5; 
            else if (blockWest.getType() === "air") targetX -= 0.5; 
        }
    }

    let dx = targetX - playerX;
    let dy = aimY - playerEyeY;
    let dz = targetZ - playerZ;

    let yaw = Math.atan2(dx, -dz) * (180 / Math.PI);
    yaw = ((yaw + 360) % 360) - 180;

    let distanceXY = Math.sqrt(dx * dx + dz * dz);
    let pitch = Math.atan2(dy, distanceXY) * (-180 / Math.PI) * 0.9995;

    wtr_chat(`Yaw: ${yaw.toFixed(2)}, Pitch: ${pitch.toFixed(2)}`);
    return [ yaw, pitch ];
}

const setRotation2 = (bx, by, bz) => {
    const [yaw, pitch] = getYawAndPitch(bx, by, bz, Player.getX(), Player.getY(), Player.getZ())
    Player.getPlayer().func_70080_a(Player.getX(), Player.getY(), Player.getZ(), yaw, pitch)
}

function setRotation3(bx, by, bz, turnSpeed, duration) {
    wtr_chat("Smooth rotating...")
    const [targetYaw, targetPitch] = [171, 2.2]//getYawAndPitch(bx, by, bz, Player.getX(), Player.getY(), Player.getZ())
    let currentYaw = Player.getYaw();
    let currentPitch = Player.getPitch();
    let newYaw;
    let newPitch;
    wtr_chat(`Current: ${currentYaw}, ${currentPitch} - Target: ${targetYaw} - ${targetPitch}`)

    let counter = 0;
    const target = 1000;
    while (currentYaw - targetYaw > 1)
    {
        wtr_chat("SMOOTH TICK")
        wtr_chat(`Difference of Yaw: ${currentYaw - targetYaw} - Differnce of Pitch: ${currentPitch - targetPitch}`)
        newYaw = currentYaw + (targetYaw - currentYaw) * turnSpeed;
        newPitch = currentPitch + (targetPitch - currentPitch) * turnSpeed;

        Player.getPlayer().func_70080_a(Player.getX(), Player.getY(), Player.getZ(), newYaw, newPitch)
        counter++;
    }
}

let turning = false;  // Flag to indicate if turning is in progress

function smoothTurnStep() {
    let currentYaw = Player.getYaw();
    let currentPitch = Player.getPitch();
    const [targetYaw, targetPitch] = [171, 2.2]//getYawAndPitch(bx, by, bz, Player.getX(), Player.getY(), Player.getZ())
    // Calculate the yaw and pitch differences
    let yawDiff = targetYaw - currentYaw;
    let pitchDiff = targetPitch - currentPitch;

    // Normalize yaw difference to -180 to 180
    if (yawDiff > 180) yawDiff -= 360;
    if (yawDiff < -180) yawDiff += 360;

    // Determine which has the greater movement needed
    let maxDiff = Math.max(Math.abs(yawDiff), Math.abs(pitchDiff));

    // Scale yaw and pitch speeds proportionally
    let yawSpeed = (Math.abs(yawDiff) / maxDiff) * turnSpeed;
    let pitchSpeed = (Math.abs(pitchDiff) / maxDiff) * turnSpeed;

    // Apply movement direction
    let newYaw = currentYaw + Math.sign(yawDiff) * yawSpeed;
    let newPitch = currentPitch + Math.sign(pitchDiff) * pitchSpeed;

    Player.getPlayer().func_70080_a(Player.getX(), Player.getY(), Player.getZ(), newYaw, newPitch)

    // Check if the movement is complete
    if (Math.abs(newYaw - targetYaw) < 0.01 && Math.abs(newPitch - targetPitch) < 0.01) {
        wtr_chat("Turn complete!");
        turning = false;
        return;
    }

    // Continue turning
    setTimeout(smoothTurnStep, .05);
}

// Start the smooth turn
function setRotation() {
    wtr_chat("Setting rotation...")
    if (turning) return;  // Prevent starting a new turn while one is in progress
    turning = true;
    smoothTurnStep();  // Begin the first step of the smooth turn
}

const setKeyState = (keyBind, state) => {
    KeyBinding.func_74510_a(keyBind.func_151463_i(), state)
}

let miningEnabled = false;

register("command", () => {
    miningEnabled = !miningEnabled;
    wtr_chat(`Mining: ${miningEnabled ? "ON" : "OFF"}`);

    if (!miningEnabled) return;
    //clickMouse()
    let x = Math.floor(Player.getX());
    let y = Math.floor(Player.getY());
    let z = Math.floor(Player.getZ());
    wtr_chat(`Player Coords: (${x}, ${y}, ${z})`);
    wtr_chat(Player.lookingAt());
    //wtr_chat(Player.lookingAt().type.name);
    let lookVec = Player.getPlayer().func_70676_i(1.0);
    let blockX = x + Math.round(lookVec.field_72450_a);
    let blockY = y + Math.round(lookVec.field_72448_b);
    let blockZ = z + Math.round(lookVec.field_72449_c);
    setRotation()//Player.lookingAt().x, Player.lookingAt().y, Player.lookingAt().z)
     
    let block = World.getBlockAt(blockX, blockY, blockZ);
    let blockName = block.getRegistryName();
    wtr_chat(block);
    wtr_chat(blockName);
    if (TargetBlocks.includes(Player.lookingAt.type.name)) {
        Client.leftClick();
    }

}).setName("waterstart").setAliases("ws");

function exampleWorldLoad() {
    wtr_chat("Water Drop Loaded!");
}
  
register("worldLoad", exampleWorldLoad);

var SimpleDisplay = new Display()
SimpleDisplay.setBackground("per line")
SimpleDisplay.setRenderLoc(5, 5)
SimpleDisplay.setLine(0, "&bWater &dDrop")

register("tick", () => {
    SimpleDisplay.setLine(1, 
        Math.round(Player.getX()) + "&7x &r" 
        + Math.round(Player.getY()) + "&7y &r"
        + Math.round(Player.getZ()) + "&7z &r"
    )

    SimpleDisplay.setLine(2,
        + " &a" + Server.getPing()
    )
})

// Pathfinder

function heuristic(a, b) {
    wtr_chat("heuristic called")
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z); // Manhattan distance
}

function isWalkable(pos) {
    wtr_chat("checking if block is walkable")
    const block = World.getBlockAt(pos.x, pos.y, pos.z);
    const blockBelow = World.getBlockAt(pos.x, pos.y - 1, pos.z);
    return block.getType() === "AIR" && blockBelow.getType() !== "AIR"; // Must have ground below
}

function getNeighbors(pos) {
    wtr_chat("neighbor func called")
    wtr_chat("pos in getNeighbors: " + JSON.stringify(pos));

    const neighbors = [];
    const directions = [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
        { x: 0, y: 1, z: 0 }, // Jump up
        { x: 0, y: -1, z: 0 } // Fall down
    ];
    wtr_chat("Directions content: " + JSON.stringify(directions));
    for (let i = 0; i < directions.length; i++) {
        let dir = directions[i];
        wtr_chat("Loop iteration " + i + " with dir: " + JSON.stringify(dir));
    
        wtr_chat("Directions array: " + JSON.stringify(directions));

        wtr_chat("Loop iteration with dir: " + JSON.stringify(dir));
        const newPos = { 
            x: pos.x + dir.x, 
            y: pos.y + dir.y, 
            z: pos.z + dir.z 
        };
        wtr_chat("newPos calculated: " + JSON.stringify(newPos));
    
        if (isWalkable(newPos)) {
            wtr_chat("newPos is walkable, adding to neighbors");
            neighbors.push(newPos);
        } else {
            wtr_chat("newPos is NOT walkable: " + JSON.stringify(newPos));
        }
    }    
    
    wtr_chat("neighbor func returned")
    return neighbors;
}

function key(pos) {
    wtr_chat(`key called with parameter: ${pos.x}, ${pos.y}, ${pos.z}`)
    return `${pos.x},${pos.y},${pos.z}`;
}

function reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = key(current);

    while (cameFrom[currentKey]) {
        current = cameFrom[currentKey];
        currentKey = key(current);
        path.unshift(current);
    }
    return path;
}

function aStar(start, goal) {
    wtr_chat("aStar called")
    const openSet = [start];  // Open set as an array
    const cameFrom = {};
    wtr_chat("basic variables done")
    const gScore = {};
    const fScore = {};
    
    gScore[key(start)] = 0;
    fScore[key(start)] = heuristic(start, goal);
    wtr_chat("Beginning loop...")
    while (openSet.length > 0) {
        // Find node with the lowest f-score
        let currentIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (fScore[key(openSet[i])] < fScore[key(openSet[currentIndex])]) {
                currentIndex = i;
            }
        }
        wtr_chat("Wasn't the for loop")
        const current = openSet.splice(currentIndex, 1)[0]; // Remove from openSet

        if (current.x === goal.x && current.y === goal.y && current.z === goal.z) {
            return reconstructPath(cameFrom, current);
        }
        wtr_chat("wasn't reconstruct path either")
        const neighbors = getNeighbors(current);
        wtr_chat("Neighbors: " + JSON.stringify(neighbors));

        for (const neighbor of getNeighbors(current) || []) { // Ensure getNeighbors() doesn't return null
            wtr_chat("for loop is working")
            const neighborKey = key(neighbor);
            wtr_chat("neighborkey is warking")
            if (!neighborKey) { // Check if key(neighbor) is valid
                wtr_chat("Invalid neighbor key, skipping...");
                continue;
            }
        
            if (!(key(current) in gScore)) { // Ensure gScore[key(current)] exists
                wtr_chat("gScore[key(current)] was undefined!");
                continue;
            }
        
            wtr_chat("Processing neighbor: " + neighborKey);
            
            const tentativeGScore = gScore[key(current)] + 1;
        
            if (tentativeGScore < (gScore[neighborKey] || Infinity)) {
                cameFrom[neighborKey] = current;
                gScore[neighborKey] = tentativeGScore;
                fScore[neighborKey] = tentativeGScore + heuristic(neighbor, goal);
        
                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y && n.z === neighbor.z)) {
                    openSet.push(neighbor);
                }
            }
        }
        
    }
    wtr_chat("No path found")
    return []; // No path found
}

register("command", () => {
    wtr_chat("Yata!!")
    const path = aStar({x: Player.getX(), y: Player.getY(), z: Player.getZ()}, {x: 55, y: 4, z: 200});
    wtr_chat("Path found: " + JSON.stringify(path));
}).setName("goto").setAliases("gt");
