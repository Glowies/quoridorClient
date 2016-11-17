<!doctype html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="description" content="The board game Quoridor, recreated using babylon.js and socket.io">
    <title>3D Quoridor Online</title>
    <link rel="shortcut icon" href="../assets/boo_icon.png">
    <!-- Bootstrap core CSS -->
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap theme -->
    <link href="../css/bootstrap-theme.min.css" rel="stylesheet">

    <script src="../js/jquery.js"></script>
    <script src="../js/bootstrap.min.js"></script>

    <!-- Custom styles for this template -->

    <!-- Plugins -->
</head>
<body style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;">
    <?php include_once('../navbar.php'); ?>
    <canvas id="renderCanvas" style="position:fixed;top:0px;width:100%;height:100%"></canvas>
    <h1 style="position:fixed; left:20px; color:white">3D Quoridor Online</h1>
    <div id="roomlist" style="position:fixed; top:-1000px;"><div class="alert alert-info" role="alert">Connecting to server...</div></div>
    <div id="playerlist" style="position:fixed; left:10px; top:-1000px;opacity:0.7">
    <div class="panel panel-default" style="position:relative;left:10px;width:300px">
      <div id="p1head" class="panel-heading">Player 1 :</div>	
      <div id="p1body" class="panel-body">
        No Player...
      </div>
    </div>
    <div class="panel panel-default" style="position:relative;left:10px;width:300px">
      <div id="p2head" class="panel-heading">Player 2 :</div>
      <div id="p2body" class="panel-body">
        No Player...
      </div>
    </div>
    </div>
    <button id="tutorialButton" type="button" class="btn btn-default btn-lg" data-toggle="modal" data-target="#tutorial" style="position:fixed; top:-1000px; opacity:0.7;"> Tutorial </button>
    <div class="modal fade" id="tutorial" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h3 class="modal-title" id="myModalLabel">How to play...</h3>
          </div>
          <div class="modal-body">
            <h4> Starting the game... </h4>
            The game will begin once both players are ready. Press the "Ready" button next to you player box to mark yourself as ready.
            <h4> Moving your character... </h4>
            You can move your character using the arrow keys. You can only move one step each turn and you cannot move through walls. Your aim is to reach the opposing players side before he reaches yours.
            <h4> Placing a wall... </h4>
            To place a wall use the WASD keys. You can place a wall anywhere you want but you cannot completely block the opposing players path. You can also rotate your wall using the R key.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">OK</button>
          </div>
        </div>
      </div>
    </div>
</body>

<script src="../js/socketio.js"></script>

<script src="../js/babylon.js"></script>
<script src="js/path.js"></script>
<script src="js/quoridor.js"></script>
</html>
