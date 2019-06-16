
function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



function runTimer() {
  var zeroTime = Date.now();
  if (!gTimerInterval) gTimerInterval = setInterval(measureTime, 100, zeroTime);


  function measureTime(zeroTime) {
    var currTime = Date.now();
    var timer = Math.floor((currTime - zeroTime) / 1000);
    gGame.secsPassed = timer;
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = timer
  }
}

function zeroTimer () {
  var elTimer = document.querySelector('.timer')
  elTimer.innerText = 0
}



function disableContextMenu () {

  if (document.addEventListener) {
      document.addEventListener('contextmenu', function (e) {
          e.preventDefault();
      }, false);
  } else {
      document.attachEvent('oncontextmenu', function () {
          window.event.returnValue = false;
      });
  }
}