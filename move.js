/* move.js contains a function move() that moves, or digs, in the specified direction.
 */

/* globals player, TANK_WIDTH, TANK_HEIGHT, MSG_DIG, MSG_MOVE,
 * collision, sendMessage, digRect, hasFired
 */

// Try to dig or move in the given direction, send update to the server, move the lens, and request a screen redraw.
function move(dir) {
  player.energy--;

  if (player.dir == dir) {

    let dx = 0, dy = 0;
    if ([9, 6, 3].includes(dir)) {
      dx = 1;
    }
    if ([1, 2, 3].includes(dir)) {
      dy = 1;
    }
    if ([7, 4, 1].includes(dir)) {
      dx = -1;
    }
    if ([9, 8, 7].includes(dir)) {
      dy = -1;
    }

    // Try to move; otherwise try to dig; otherwise move.
    let area = {x: player.x + dx, y: player.y + dy, w: TANK_WIDTH, h: TANK_HEIGHT};
    if (! collision(area)) {
      let dugPixels = digRect(area.x, area.y, area.w, area.h);
      if (dugPixels > 0) {
        sendMessage(MSG_DIG, area);

        // When digging very little, randomly move forward
        let randomMove = (dugPixels < TANK_HEIGHT && (Math.random() * 10 - dugPixels > 7));

        if (hasFired() || randomMove) {
          player.x = player.x + dx;
          player.y = player.y + dy;
          sendMessage(MSG_MOVE, player);
        }
      } else {
        player.x = player.x + dx;
        player.y = player.y + dy;
        sendMessage(MSG_MOVE, player);
      }
    }
  } else {
    player.dir = dir;
    sendMessage(MSG_MOVE, player);
  }
}
