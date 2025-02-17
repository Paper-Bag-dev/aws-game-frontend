import * as ex from "excalibur";
import { useEffect, useState } from "react";
import { Resources } from "./Resources/resources";
import BaseGameScene from "./Scene/Scene";
import testMap3 from "./assets/testMap3.tmj";
import * as tiled from "@excaliburjs/plugin-tiled";
import socket from "./SocketManager/socketManager";
import CharacterSelect from "./Components/CharacterSelect";

function App() {
  const [gameState, setGameState] = useState("preGame");

  useEffect(() => {
    let userID = "";
    let player1 = "";
    let player2 = "";
    let player3 = "";

    let players: string[] | null;

    // ID SETTING
    socket.on("server-playerId", (data) => {
      // userID = data.playerId;
      userID = socket.id as string;
      console.log("UserID", userID);
      // initGame();
    });

    socket.on("server-startGame", (data) => {
      players = data.players;
      setGameState("game");
      initGame();
    });

    const initGame = () => {
      const game = new ex.Engine({
        width: 380,
        height: 256,
        pixelArt: true,
        pixelRatio: 3,
        pointerScope: ex.PointerScope.Canvas,
        fixedUpdateFps: 60,
        canvasElementId: "game-canvas",
        displayMode: ex.DisplayMode.FitScreen,
        backgroundColor: ex.Color.Black,
      });

      const tiledMapResource = new tiled.TiledResource(testMap3, {
        useTilemapCameraStrategy: true,
      });

      const loader = new ex.Loader([
        ...Object.values(Resources),
        tiledMapResource,
      ]);

      game.start(loader).then(() => {
        const gameScene = new BaseGameScene(
          players as string[],
          userID,
          socket,
          tiledMapResource
        );
        game.add("BaseGameScene", gameScene);

        game.goToScene("BaseGameScene", {
          destinationIn: new ex.FadeInOut({ duration: 1000, direction: "in" }),
        });
      });
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-screen text-white bg-black">
      <div className="px-12 bg-[#191919] py-6 flex justify-center items-center w-full h-20">
        <span className="text-2xl">Game Proto 7</span>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        <CharacterSelect gameState={gameState} />
        <canvas className="border-2 border-[#333333]" id="game-canvas"></canvas>
      </div>
    </div>
  );
}

export default App;
