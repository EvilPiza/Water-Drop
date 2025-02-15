import { KeyBind } from "KeyBind"
import { register } from "register"
import { Client } from "Client"
import { World } from "World"
import { Player } from "Player"

let miningEnabled = false;
const mineKey = new KeyBind("Toggle Mining", Keyboard.KEY_G, "Mining Helper");

register("tick", () => {
    if (mineKey.isPressed()) {
        miningEnabled = !miningEnabled;
        ChatLib.chat(`Mining: ${miningEnabled ? "ON" : "OFF"}`);
    }

    if (!miningEnabled) return;

    let x = Math.floor(Player.getX());
    let y = Math.floor(Player.getY());
    let z = Math.floor(Player.getZ());

    let lookVec = Player.getPlayer().func_70676_i(1.0);
    let blockX = x + Math.round(lookVec.field_72450_a);
    let blockY = y + Math.round(lookVec.field_72448_b);
    let blockZ = z + Math.round(lookVec.field_72449_c);

    let block = World.getBlockAt(blockX, blockY, blockZ);
    let blockName = block.getRegistryName();

    if (blockName.includes("mithril") || blockName.includes("diamond_ore")) {
        Client.leftClick();
    }
});
