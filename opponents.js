/* opponents.js contains an array with the opponents information,
 * and attaches helper functions to retreive and update opponents.
 * There are also two functions to check if an opponent is visible
 * on-screen.
 */

/* globals collides, area, lens
 */

// List of other players
const opponents = [];

opponents.get = function(id) {
  return opponents.find(opp => opp.id == id);
}

opponents.indexOf = function(o) {
  if (o) {
    return opponents.map(opp => opp.id).indexOf(o.id);
  } else {
    return -1;
  }
}

opponents.set = function(o) {
  const i = opponents.indexOf(o);
  if (i >= 0) {
    opponents[i] = o;
  } else {
    opponents.push(o);
  } 
}

opponents.remove = function(o) {
  const i = opponents.indexOf(o);
  if (i >= 0) {
    opponents.splice(i, 1);
  }
}

function opponentsOnScreen() {
  return opponents.some(opp => collides(area(opp), lens));
}

function onScreen(id) {
  const opp = opponents.get(id);
  if (opp) {
    return collides(area(opponents.get(id)), lens);
  }
}
