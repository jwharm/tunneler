/* collision.js contains helper functions to detect collisions (overlap) between objects
 * in the game. The function collides() is a really simple collision function between two
 * rectangles; the function collision() is much more complex: it checks if the given 
 * rectangle overlaps with shapes on the map or with an opponent.
 */

/* globals MAP_WIDTH, MAP_HEIGHT,
 * shapesData, player, victim, opponents,
 * area
 */

// Return-codes from the collision function.
const HIT_NOTHING = 0;
const HIT_PLAYER  = 1;
const HIT_OBJECT  = 2;

// Who has been hit
let victim = null;

// Helper function to calculate a collision
function collides(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w
      && rect1.x + rect1.w > rect2.x
      && rect1.y < rect2.y + rect2.h
      && rect1.y + rect1.h > rect2.y;
}

// Check if the given rectangle collides with a shape on the map or with an opponent
function collision(rect, includeSelf = false) {
  victim = null;

  // Check if we collide with a shape on the map
  for (let y = rect.y; y < rect.y + rect.h; y++) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      let a = (y * MAP_WIDTH * 4) + (x * 4) + 3;
      if (shapesData[a] != 0) {
        return HIT_OBJECT;
      }
    }
  }

  // Check if own player was hit
  if (includeSelf && collides(rect, area(player))) {
    victim = player;
    return HIT_PLAYER;
  }
  // Check if other player was hit
  victim = opponents.find(o => collides(rect, area(o)));
  if (victim) {
    return HIT_PLAYER;
  }
  
  return HIT_NOTHING;
}
