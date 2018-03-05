function MoveToCommand(receiver, x, y) {
  this.receiver = receiver;
  this.x = x;
  this.y = y;

  this.execute = function()
  {
    this.receiver.moveTo(x, y);
  }
}

// --------------------------------------------------------------------------

