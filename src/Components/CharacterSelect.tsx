import React, { useEffect, useState } from "react";
import ElfArcher from "../assets/characters/ElfArcher.png";
import { Socket } from "socket.io-client";
import socket from "../SocketManager/socketManager";

interface CharacterDesc {
  id: number;
  image: string;
  name: string;
  description: string;
  state: string; // 'unselected' or 'selected'
}

const characters: CharacterDesc[] = [
  {
    id: 1,
    image: ElfArcher,
    name: "Elf Archer",
    description: "This is a description for Character 1.",
    state: "unselected",
  },
  {
    id: 2,
    image: "/path-to-image2.jpg",
    name: "Character 2",
    description: "This is a description for Character 2.",
    state: "unselected",
  },
  {
    id: 3,
    image: "/path-to-image3.jpg",
    name: "Character 3",
    description: "This is a description for Character 3.",
    state: "unselected",
  },
];

const CharacterSelect = ({gameState} : {gameState: string}) => {
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterDesc | null>(null);
  const [name, setName] = useState("");
  const [charState, setCharState] = useState<CharacterDesc[]>(characters);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle character selection
  const handleCharacterClick = (character: CharacterDesc) => {
    if (character.state === "selected" || isSubmitted) return;
    setSelectedCharacter(character);
  };

  // Handle submission
  const handleSubmit = () => {
    if (!name) {
      alert("Name is required!");
      return;
    }

    if (selectedCharacter) {
      const data = {
        id: socket.id,
        name,
        character: selectedCharacter.name,
      };

      socket.emit("client-character", data);
      setIsSubmitted(true); // Mark the form as submitted
    }
  };

  useEffect(() => {
    socket.on("server-client-character", (data) => {
      console.log("client side data", data);
      // Listener for updates from the server
      const updatedCharacters = charState.map((character) => {
        if (character.name === data.character) {
          return { ...character, state: "selected" };
        }
        return character;
      });
      setCharState(updatedCharacters);
    });
  }, []);

  return (
    <div className={`border-2 items-center flex flex-col border-[#333333] bg-black w-[60rem] h-[40rem] ${gameState !== "preGame"? "hidden" : ""}`}>
      <span className="px-4 py-8 text-5xl border-b-2 border-gray-500">
        Character Selection
      </span>

      <div className="flex flex-col items-start w-full max-w-md mx-auto my-12">
        <label
          htmlFor="dark-input"
          className="mb-2 text-sm font-medium text-gray-300"
        >
          Enter Your Name*:
        </label>
        <input
          id="dark-input"
          type="text"
          placeholder="Type your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 text-gray-200 placeholder-gray-500 transition duration-200 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex w-full justify-evenly">
        {charState.map((character) => (
          <div
            key={character.id}
            onClick={
              character.state === "selected"
                ? () => {}
                : () => handleCharacterClick(character)
            }
            className={`flex flex-col items-center p-4 text-center rounded-md border-4 cursor-pointer transition-transform duration-300 ${
              character.state === "selected"
                ? "shadow-lg border-blue-400 pointer-events-none opacity-50"
                : selectedCharacter?.id === character.id
                ? "border-gray-400 bg-blue-800 scale-105"
                : "border-[#333333] bg-[#1f2937] hover:bg-[#374151] hover:border-blue-400"
            } ${
              isSubmitted || character.state === "selected"
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            <img
              src={character.image}
              alt={character.name}
              className={`object-cover h-[128px] w-[128px] mb-4 transition-transform ${
                character.state === "selected" ? "scale-110" : "hover:scale-110"
              }`}
            />
            <h2
              className={`text-lg font-bold ${
                character.state === "selected"
                  ? "text-blue-400"
                  : "text-gray-200"
              }`}
            >
              {character.name}
            </h2>
            <p className="text-sm text-gray-400">{character.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="text-gray-200 mt-12 w-64 h-14 bg-[#0b0b38] border-[#333333] border-2 rounded-md hover:bg-[#1a1a66] transition-all duration-300"
      >
        Select Character
      </button>
    </div>
  );
};

export default CharacterSelect;
